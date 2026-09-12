import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {
  createGamePack,
  deleteGamePack,
  fetchGamePacks,
  gamePackFileUrl,
  getApiBaseUrl,
  pingClassroomApi,
  updateGamePack,
  uploadGamePackFile,
} from '@site/src/api/classroomClient';
import styles from './fightingGameWorkshop.module.css';

const CANVAS_H = 576;
const CANVAS_W = 1024;
/** 游戏里站位 Y 是碰撞盒顶部；脚底约在 y + HIT_HEIGHT。 */
const HIT_HEIGHT = 150;

function packImageUrl(pack) {
  const file =
    pack.files?.find((f) => f.role === 'image') ||
    pack.files?.find((f) => f.role === 'z1') ||
    pack.files?.find((f) => f.role === 'z3') ||
    pack.files?.[0];
  return file ? gamePackFileUrl(file.url) : '';
}

function packLayerUrl(pack, role) {
  const file = pack.files?.find((f) => f.role === role);
  return file ? gamePackFileUrl(file.url) : '';
}

const PARALLAX_LAYER_ROLES = [
  {role: 'z3', label: '远景 z3', hint: '天空 / 远山（滚得最慢）'},
  {role: 'z2', label: '中景 z2', hint: '树木 / 建筑（中速）'},
  {role: 'z1', label: '近景 z1', hint: '地面站位层（跟镜头）'},
];

const TOWN_PARALLAX_PACK = {
  z3: '/games/fighting-game-phaser/img/bg/town_wide_z3.png',
  z2: '/games/fighting-game-phaser/img/bg/town_wide_z2.png',
  z1: '/games/fighting-game-phaser/img/bg/town_wide_z1.png',
};

function tracksFromMeta(meta) {
  const tracks = Array.isArray(meta?.tracks) ? meta.tracks : [];
  if (!tracks.length) return [330];
  return tracks.map((t) => Number(t?.y) || 330);
}

function zoomFromMeta(meta) {
  const z = Number(meta?.bgZoom);
  return Number.isFinite(z) && z >= 1 ? z : 1;
}

function resizeTracks(prev, count) {
  const next = [];
  for (let i = 0; i < count; i++) {
    next.push(prev[i] != null ? prev[i] : i === 0 ? 330 : 280);
  }
  return next;
}

function layoutStageBackdrop(srcW, srcH, {stageW = CANVAS_W, canvasH = CANVAS_H, zoom = 1} = {}) {
  if (!srcW || !srcH) return {x: 0, y: 0, w: stageW, h: canvasH};
  const z = Math.max(1, Number(zoom) || 1);
  const scale = Math.max(stageW / srcW, canvasH / srcH) * z;
  const w = srcW * scale;
  const h = srcH * scale;
  return {x: (stageW - w) / 2, y: canvasH - h, w, h};
}

function ParamDragger({label, valueText, hint, min, max, step = 1, value, onChange, ariaLabel}) {
  return (
    <div className={styles.param}>
      <div className={styles.paramHead}>
        <span className={styles.paramLabel}>{label}</span>
        <span className={styles.paramValue}>{valueText}</span>
      </div>
      {hint ? <span className={styles.paramHint}>{hint}</span> : null}
      <input
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel || label}
      />
    </div>
  );
}

function TrackPreview({imageUrl, layerUrls, trackYs, zoom = 1, parallax = false}) {
  const canvasRef = useRef(null);
  const layers = layerUrls?.filter(Boolean) || [];
  const hasParallax = parallax && layers.length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const sources = hasParallax ? layers : imageUrl ? [imageUrl] : [];
    if (!sources.length) return undefined;

    let cancelled = false;
    const images = sources.map(() => new Image());
    let pending = images.length;

    const draw = () => {
      if (cancelled) return;
      const w = canvas.width;
      const h = canvas.height;
      const sx = w / CANVAS_W;
      const sy = h / CANVAS_H;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      images.forEach((img, i) => {
        if (!img.complete || !img.naturalWidth) return;
        const layout = layoutStageBackdrop(img.width, img.height, {
          stageW: hasParallax ? 3072 : CANVAS_W,
          zoom,
        });
        // Preview crops the left viewport of a wide parallax stage.
        const viewScale = CANVAS_W / (hasParallax ? 3072 : CANVAS_W);
        ctx.globalAlpha = hasParallax && i < images.length - 1 ? 0.85 + i * 0.05 : 1;
        ctx.drawImage(
          img,
          layout.x * sx * viewScale,
          layout.y * sy,
          layout.w * sx * viewScale,
          layout.h * sy,
        );
        ctx.globalAlpha = 1;
      });
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
      trackYs.forEach((y, i) => {
        const py = (y / CANVAS_H) * h;
        const bodyH = (HIT_HEIGHT / CANVAS_H) * h;
        const feetY = py + bodyH;
        ctx.strokeStyle = i === 0 ? '#facc15' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '12px sans-serif';
        ctx.fillText(`站位 ${i + 1}: y=${y}`, 8, Math.max(14, py - 6));
        const stubX = w * 0.2 - 8;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(stubX, py, 16, bodyH);
        ctx.globalAlpha = 1;
        ctx.fillRect(stubX - 4, feetY - 2, 24, 4);
        ctx.fillText('脚底', stubX + 28, feetY + 4);
      });
    };

    images.forEach((img, i) => {
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        pending -= 1;
        if (pending <= 0) draw();
      };
      img.onerror = () => {
        pending -= 1;
        if (pending <= 0) draw();
      };
      img.src = sources[i];
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, layerUrls, trackYs, zoom, hasParallax]);

  if (parallax && !layers.length) {
    return <div className={styles.previewEmpty}>请上传 z3 / z2 / z1 以预览站位</div>;
  }

  if (!parallax && !imageUrl) {
    return <div className={styles.previewEmpty}>请选择背景 PNG 以预览站位</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.previewFrame}
      width={640}
      height={360}
      aria-label="关卡站位预览"
    />
  );
}

function StageTuneEditor({
  parallax,
  mode,
  imageUrl,
  layerUrls,
  trackCount,
  onTrackCount,
  trackYs,
  onTrackYs,
  zoom,
  onZoom,
  stageWidth,
  onStageWidth,
  name,
  onName,
  onFile,
  onLayerFile,
  onSubmitCreate,
  editTitle,
  onSaveEdit,
  onCancelEdit,
  testUrl,
  busy,
  canSubmit,
  packDownloads,
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.previewCol}>
        <span className={styles.sectionLabel}>预览</span>
        <TrackPreview
          imageUrl={parallax ? '' : imageUrl}
          layerUrls={parallax ? layerUrls : null}
          trackYs={trackYs}
          zoom={zoom}
          parallax={parallax}
        />
      </div>

      <div className={styles.controlsCol}>
        <span className={styles.sectionLabel}>
          {mode === 'edit' ? `编辑 — ${editTitle}` : parallax ? '上传视差关卡' : '上传'}
        </span>

        {parallax && packDownloads && mode === 'create' ? (
          <div style={{marginBottom: 12}}>
            <span className={styles.sectionLabel}>模板下载（小镇）</span>
            <p className={styles.paramHint} style={{marginBottom: 8}}>
              可先下载三层宽图当模板，再在像素编辑器里改画后上传。
            </p>
            <div className={styles.actions} style={{marginTop: 0}}>
              {PARALLAX_LAYER_ROLES.map(({role, label}) => (
                <a
                  key={role}
                  className={styles.btnGhost}
                  href={packDownloads[role]}
                  download={`${role}.png`}
                  target="_blank"
                  rel="noreferrer"
                >
                  下载 {label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        {mode === 'create' ? (
          <>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>关卡名称</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => onName(e.target.value)}
                maxLength={64}
                placeholder={parallax ? '我的视差小镇' : '我的像素关卡'}
              />
            </label>
            {parallax ? (
              PARALLAX_LAYER_ROLES.map(({role, label, hint}) => (
                <label key={role} className={styles.field}>
                  <span className={styles.fieldLabel}>
                    {label}
                    <span className={styles.paramHint}> — {hint}</span>
                  </span>
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/png"
                    onChange={(e) => onLayerFile(role, e.target.files?.[0] || null)}
                  />
                </label>
              ))
            ) : (
              <label className={styles.field}>
                <span className={styles.fieldLabel}>背景 PNG</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/png"
                  onChange={(e) => onFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </>
        ) : null}

        {parallax ? (
          <ParamDragger
            label="关卡宽度"
            valueText={String(stageWidth)}
            hint="宽地图才能看出视差；内置小镇为 3072"
            min={1024}
            max={4096}
            step={256}
            value={stageWidth}
            onChange={onStageWidth}
          />
        ) : null}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>站位线数量</span>
          <select
            className={styles.select}
            value={trackCount}
            onChange={(e) => onTrackCount(Number(e.target.value))}
          >
            <option value={1}>1 条（地面）</option>
            <option value={2}>2 条（前排 / 后排）</option>
          </select>
        </label>

        {trackYs.map((y, index) => (
          <ParamDragger
            key={index}
            label={trackCount > 1 ? `站位 ${index + 1} 的 Y` : '地面站位 Y'}
            valueText={String(y)}
            hint={`碰撞盒顶部；脚底约在 y=${y + HIT_HEIGHT}`}
            min={180}
            max={500}
            value={y}
            onChange={(value) =>
              onTrackYs(trackYs.map((item, i) => (i === index ? value : item)))
            }
          />
        ))}

        <ParamDragger
          label="背景缩放"
          valueText={`${zoom.toFixed(1)}×`}
          hint="图太小或留白多时调大"
          min={10}
          max={40}
          value={Math.round(zoom * 10)}
          onChange={(raw) => onZoom(raw / 10)}
        />

        <div className={styles.actions}>
          {mode === 'create' ? (
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={busy || !canSubmit}
              onClick={onSubmitCreate}
            >
              {busy ? '上传中…' : parallax ? '上传视差关卡' : '上传关卡'}
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={busy || !canSubmit}
                onClick={onSaveEdit}
              >
                {busy ? '保存中…' : '保存'}
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                disabled={busy}
                onClick={onCancelEdit}
              >
                取消
              </button>
              {testUrl ? (
                <a className={styles.btnGhost} href={testUrl} target="_blank" rel="noreferrer">
                  打开游戏
                </a>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FightingGameWorkshop({stageOnly = false, parallax = false} = {}) {
  const {auth} = useSiteAuth();
  const [online, setOnline] = useState(null);
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState('create');
  const [editingPack, setEditingPack] = useState(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [layerFiles, setLayerFiles] = useState({z1: null, z2: null, z3: null});
  const [previewUrl, setPreviewUrl] = useState('');
  const [layerPreviewUrls, setLayerPreviewUrls] = useState({z1: '', z2: '', z3: ''});
  const [trackCount, setTrackCount] = useState(1);
  const [trackYs, setTrackYs] = useState([330]);
  const [bgZoom, setBgZoom] = useState(1);
  const [stageWidth, setStageWidth] = useState(parallax ? 3072 : 1024);

  const isStudent = auth?.role === 'student' && auth?.name && auth?.rosterId;

  const stages = useMemo(() => packs.filter((p) => p.kind === 'stage'), [packs]);

  const refresh = useCallback(async () => {
    setError('');
    const ok = await pingClassroomApi();
    setOnline(ok);
    if (!ok) {
      setPacks([]);
      return;
    }
    try {
      const data = await fetchGamePacks(stageOnly ? 'stage' : undefined);
      setPacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '加载失败');
      setPacks([]);
    }
  }, [stageOnly]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (mode !== 'create' || !file || parallax) {
      if (mode === 'create' && !parallax) setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, mode, parallax]);

  useEffect(() => {
    if (mode !== 'create' || !parallax) return undefined;
    const urls = {};
    const revokes = [];
    for (const role of ['z3', 'z2', 'z1']) {
      const f = layerFiles[role];
      if (f) {
        const url = URL.createObjectURL(f);
        urls[role] = url;
        revokes.push(url);
      } else {
        urls[role] = '';
      }
    }
    setLayerPreviewUrls(urls);
    return () => revokes.forEach((u) => URL.revokeObjectURL(u));
  }, [layerFiles, mode, parallax]);

  useEffect(() => {
    setTrackYs((prev) => resizeTracks(prev, trackCount));
  }, [trackCount]);

  function ownedByMe(pack) {
    return isStudent && pack.author === auth.name && pack.rosterSlug === auth.rosterId;
  }

  function resetCreateForm() {
    setMode('create');
    setEditingPack(null);
    setName('');
    setFile(null);
    setLayerFiles({z1: null, z2: null, z3: null});
    setPreviewUrl('');
    setLayerPreviewUrls({z1: '', z2: '', z3: ''});
    setTrackCount(1);
    setTrackYs([330]);
    setBgZoom(1);
    setStageWidth(parallax ? 3072 : 1024);
  }

  function beginEdit(pack) {
    const ys = tracksFromMeta(pack.meta);
    setMode('edit');
    setEditingPack(pack);
    setName(pack.name || '');
    setFile(null);
    setLayerFiles({z1: null, z2: null, z3: null});
    setPreviewUrl(packImageUrl(pack));
    setLayerPreviewUrls({
      z3: packLayerUrl(pack, 'z3'),
      z2: packLayerUrl(pack, 'z2'),
      z1: packLayerUrl(pack, 'z1'),
    });
    setTrackCount(ys.length >= 2 ? 2 : 1);
    setTrackYs(ys.length ? ys : [330]);
    setBgZoom(zoomFromMeta(pack.meta));
    setStageWidth(Number(pack.meta?.width) || (pack.meta?.mode === 'parallax' ? 3072 : 1024));
    setError('');
  }

  function testStageUrl(pack) {
    return `/games/fighting-game-phaser/index.html?${new URLSearchParams({
      stage: pack.id,
      api: getApiBaseUrl(),
    }).toString()}`;
  }

  function setLayerFile(role, nextFile) {
    setLayerFiles((prev) => ({...prev, [role]: nextFile}));
  }

  async function handleCreate() {
    if (!isStudent) {
      setError('请先以学生身份登录（设置齿轮）再上传。');
      return;
    }
    if (!online) {
      setError('后端离线，无法上传。');
      return;
    }
    if (!name.trim()) {
      setError('请填写关卡名称。');
      return;
    }
    if (parallax) {
      if (!layerFiles.z1 || !layerFiles.z2 || !layerFiles.z3) {
        setError('视差关卡需要上传 z3、z2、z1 三张 PNG。');
        return;
      }
    } else if (!file) {
      setError('请填写名称并选择 PNG。');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const meta = parallax
        ? {
            mode: 'parallax',
            width: Number(stageWidth) || 3072,
            fit: 'cover',
            bgZoom: Number(bgZoom) || 1,
            tracks: trackYs.map((y) => ({y: Number(y)})),
            thumbCropX: Math.round((Number(stageWidth) || 3072) / 3),
          }
        : {
            mode: 'single',
            width: 1024,
            fit: 'cover',
            bgZoom: Number(bgZoom) || 1,
            tracks: trackYs.map((y) => ({y: Number(y)})),
          };
      const pack = await createGamePack({
        kind: 'stage',
        name: name.trim(),
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        meta,
      });
      if (parallax) {
        for (const {role} of PARALLAX_LAYER_ROLES) {
          await uploadGamePackFile(pack.id, {
            role,
            rosterSlug: auth.rosterId,
            ownerName: auth.name,
            file: layerFiles[role],
          });
        }
      } else {
        await uploadGamePackFile(pack.id, {
          role: 'image',
          rosterSlug: auth.rosterId,
          ownerName: auth.name,
          file,
        });
      }
      await updateGamePack(pack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        meta,
      });
      resetCreateForm();
      await refresh();
    } catch (err) {
      setError(err.message || '上传失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingPack || !ownedByMe(editingPack)) return;
    setBusy(true);
    setError('');
    try {
      const isParallax = editingPack.meta?.mode === 'parallax' || parallax;
      await updateGamePack(editingPack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        meta: {
          ...(editingPack.meta || {}),
          mode: isParallax ? 'parallax' : editingPack.meta?.mode || 'single',
          width: isParallax
            ? Number(stageWidth) || editingPack.meta?.width || 3072
            : editingPack.meta?.width || 1024,
          fit: 'cover',
          bgZoom: Number(bgZoom) || 1,
          tracks: trackYs.map((y) => ({y: Number(y)})),
        },
      });
      resetCreateForm();
      await refresh();
    } catch (err) {
      setError(err.message || '保存失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(pack) {
    if (!isStudent || !window.confirm(`确定删除「${pack.name}」？`)) return;
    setBusy(true);
    try {
      await deleteGamePack(pack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
      });
      if (editingPack?.id === pack.id) resetCreateForm();
      await refresh();
    } catch (err) {
      setError(err.message || '删除失败');
    } finally {
      setBusy(false);
    }
  }

  const createReady = parallax
    ? Boolean(online && isStudent && name.trim() && layerFiles.z1 && layerFiles.z2 && layerFiles.z3)
    : Boolean(online && isStudent && name.trim() && file);

  return (
    <div>
      {error ? (
        <p style={{color: 'var(--ifm-color-danger)'}} role="alert">
          {error}
        </p>
      ) : null}

      <StageTuneEditor
        parallax={parallax}
        mode={mode}
        imageUrl={previewUrl}
        layerUrls={[layerPreviewUrls.z3, layerPreviewUrls.z2, layerPreviewUrls.z1]}
        trackCount={trackCount}
        onTrackCount={setTrackCount}
        trackYs={trackYs}
        onTrackYs={setTrackYs}
        zoom={bgZoom}
        onZoom={setBgZoom}
        stageWidth={stageWidth}
        onStageWidth={setStageWidth}
        name={name}
        onName={setName}
        onFile={setFile}
        onLayerFile={setLayerFile}
        onSubmitCreate={handleCreate}
        editTitle={editingPack?.name || ''}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={resetCreateForm}
        testUrl={editingPack ? testStageUrl(editingPack) : ''}
        busy={busy}
        canSubmit={
          mode === 'create' ? createReady : Boolean(online && isStudent && editingPack)
        }
        packDownloads={parallax ? TOWN_PARALLAX_PACK : null}
      />

      <h3 className={styles.sectionLabel} style={{marginTop: '1.25rem'}}>
        班级关卡
      </h3>
      {!online && online != null ? (
        <p>后端离线，无法加载画廊。</p>
      ) : stages.length === 0 ? (
        <p>还没有同学上传 — 来做第一个吧。</p>
      ) : (
        <div className={styles.gallery}>
          {stages.map((pack) => {
            const preview = packImageUrl(pack);
            const owned = ownedByMe(pack);
            const ys = tracksFromMeta(pack.meta);
            const active = editingPack?.id === pack.id && mode === 'edit';
            const isPx = pack.meta?.mode === 'parallax';
            return (
              <article
                key={pack.id}
                className={`${styles.card} ${active ? styles.cardActive : ''}`}
              >
                {preview ? <img className={styles.cardThumb} src={preview} alt="" /> : null}
                <div className={styles.cardTitle}>{pack.name}</div>
                <div className={styles.cardMeta}>
                  作者 {pack.author || '未知'} · Y {ys.join(', ')}
                  {isPx ? ' · 视差' : ''}
                  {zoomFromMeta(pack.meta) > 1
                    ? ` · ${zoomFromMeta(pack.meta).toFixed(1)}×`
                    : ''}
                </div>
                <div className={styles.actions}>
                  <a
                    className={styles.btnGhost}
                    href={testStageUrl(pack)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开
                  </a>
                  {owned ? (
                    <>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        disabled={busy}
                        onClick={() => beginEdit(pack)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        disabled={busy}
                        onClick={() => handleDelete(pack)}
                      >
                        删除
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
