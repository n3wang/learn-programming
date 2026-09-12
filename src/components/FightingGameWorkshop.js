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
    pack.files?.find((f) => f.role === 'z3') ||
    pack.files?.[0];
  return file ? gamePackFileUrl(file.url) : '';
}

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

function TrackPreview({imageUrl, trackYs, zoom = 1}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return undefined;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      const w = canvas.width;
      const h = canvas.height;
      const sx = w / CANVAS_W;
      const sy = h / CANVAS_H;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      const layout = layoutStageBackdrop(img.width, img.height, {zoom});
      ctx.drawImage(img, layout.x * sx, layout.y * sy, layout.w * sx, layout.h * sy);
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
    img.onerror = () => {
      if (cancelled) return;
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f87171';
      ctx.font = '14px sans-serif';
      ctx.fillText('预览图加载失败', 12, canvas.height / 2);
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl, trackYs, zoom]);

  if (!imageUrl) {
    return <div className={styles.previewEmpty}>请选择 PNG 背景以预览站位</div>;
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
  mode,
  imageUrl,
  trackCount,
  onTrackCount,
  trackYs,
  onTrackYs,
  zoom,
  onZoom,
  name,
  onName,
  onFile,
  onSubmitCreate,
  editTitle,
  onSaveEdit,
  onCancelEdit,
  testUrl,
  busy,
  canSubmit,
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.previewCol}>
        <span className={styles.sectionLabel}>预览</span>
        <TrackPreview imageUrl={imageUrl} trackYs={trackYs} zoom={zoom} />
      </div>

      <div className={styles.controlsCol}>
        <span className={styles.sectionLabel}>
          {mode === 'edit' ? `编辑 — ${editTitle}` : '上传'}
        </span>

        {mode === 'create' ? (
          <>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>关卡名称</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => onName(e.target.value)}
                maxLength={64}
                placeholder="我的像素关卡"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>背景 PNG</span>
              <input
                className={styles.input}
                type="file"
                accept="image/png"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
            </label>
          </>
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
              {busy ? '上传中…' : '上传关卡'}
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

export default function FightingGameWorkshop({stageOnly = false} = {}) {
  const {auth} = useSiteAuth();
  const [online, setOnline] = useState(null);
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState('create');
  const [editingPack, setEditingPack] = useState(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [trackCount, setTrackCount] = useState(1);
  const [trackYs, setTrackYs] = useState([330]);
  const [bgZoom, setBgZoom] = useState(1);

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
    if (mode !== 'create' || !file) {
      if (mode === 'create') setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, mode]);

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
    setPreviewUrl('');
    setTrackCount(1);
    setTrackYs([330]);
    setBgZoom(1);
  }

  function beginEdit(pack) {
    const ys = tracksFromMeta(pack.meta);
    setMode('edit');
    setEditingPack(pack);
    setName(pack.name || '');
    setFile(null);
    setPreviewUrl(packImageUrl(pack));
    setTrackCount(ys.length >= 2 ? 2 : 1);
    setTrackYs(ys.length ? ys : [330]);
    setBgZoom(zoomFromMeta(pack.meta));
    setError('');
  }

  function testStageUrl(pack) {
    return `/games/fighting-game-phaser/index.html?${new URLSearchParams({
      stage: pack.id,
      api: getApiBaseUrl(),
    }).toString()}`;
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
    if (!name.trim() || !file) {
      setError('请填写名称并选择 PNG。');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const meta = {
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
      await uploadGamePackFile(pack.id, {
        role: 'image',
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        file,
      });
      await updateGamePack(pack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        meta: {
          ...meta,
          tracks: trackYs.map((y) => ({y: Number(y)})),
          bgZoom: Number(bgZoom) || 1,
        },
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
      await updateGamePack(editingPack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        meta: {
          ...(editingPack.meta || {}),
          mode: editingPack.meta?.mode || 'single',
          width: editingPack.meta?.width || 1024,
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

  return (
    <div>
      {error ? (
        <p style={{color: 'var(--ifm-color-danger)'}} role="alert">
          {error}
        </p>
      ) : null}

      <StageTuneEditor
        mode={mode}
        imageUrl={previewUrl}
        trackCount={trackCount}
        onTrackCount={setTrackCount}
        trackYs={trackYs}
        onTrackYs={setTrackYs}
        zoom={bgZoom}
        onZoom={setBgZoom}
        name={name}
        onName={setName}
        onFile={setFile}
        onSubmitCreate={handleCreate}
        editTitle={editingPack?.name || ''}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={resetCreateForm}
        testUrl={editingPack ? testStageUrl(editingPack) : ''}
        busy={busy}
        canSubmit={
          mode === 'create'
            ? Boolean(online && isStudent && name.trim() && file)
            : Boolean(online && isStudent && editingPack)
        }
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
            return (
              <article
                key={pack.id}
                className={`${styles.card} ${active ? styles.cardActive : ''}`}
              >
                {preview ? <img className={styles.cardThumb} src={preview} alt="" /> : null}
                <div className={styles.cardTitle}>{pack.name}</div>
                <div className={styles.cardMeta}>
                  作者 {pack.author || '未知'} · Y {ys.join(', ')}
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
