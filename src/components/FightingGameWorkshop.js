import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {
  createGamePack,
  deleteGamePack,
  fetchGamePacks,
  gamePackFileUrl,
  pingClassroomApi,
  updateGamePack,
  uploadGamePackFile,
} from '@site/src/api/classroomClient';

const CANVAS_H = 576;

const panelStyle = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  padding: '1rem 1.1rem',
  marginTop: '1.25rem',
  background: 'var(--ifm-background-surface-color)',
};

const buttonStyle = {
  padding: '0.4rem 0.75rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-color-primary)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const secondaryBtn = {
  ...buttonStyle,
  background: 'transparent',
  color: 'var(--ifm-font-color-base)',
};

const inputStyle = {
  padding: '0.35rem 0.5rem',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  width: '100%',
  maxWidth: 420,
};

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

/** Interactive preview: background + draggable-looking track lines (via sliders). */
function TrackPreview({imageUrl, trackYs}) {
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
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
      const scale = Math.min(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      trackYs.forEach((y, i) => {
        const py = dy + (y / CANVAS_H) * dh;
        ctx.strokeStyle = i === 0 ? '#facc15' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(dx, py);
        ctx.lineTo(dx + dw, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '12px sans-serif';
        ctx.fillText(`track ${i + 1}: y=${y}`, dx + 8, Math.max(14, py - 6));
        // Feet marker
        ctx.fillRect(dx + dw * 0.2 - 8, py - 40, 16, 40);
      });
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl, trackYs]);

  if (!imageUrl) {
    return (
      <div
        style={{
          height: 200,
          borderRadius: 8,
          background: 'var(--ifm-color-emphasis-200)',
          display: 'grid',
          placeItems: 'center',
          fontSize: '0.85rem',
        }}
      >
        Choose a PNG to preview tracks
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      style={{width: '100%', maxWidth: 640, borderRadius: 8, background: '#111'}}
    />
  );
}

export default function FightingGameWorkshop({stageOnly = false} = {}) {
  const {auth} = useSiteAuth();
  const [online, setOnline] = useState(null);
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [trackCount, setTrackCount] = useState(1);
  const [trackYs, setTrackYs] = useState([330]);

  const isStudent = auth?.role === 'student' && auth?.name && auth?.rosterId;

  const stages = useMemo(
    () => packs.filter((p) => p.kind === 'stage'),
    [packs],
  );
  const mine = useMemo(
    () =>
      stages.filter(
        (p) =>
          isStudent && p.author === auth.name && p.rosterSlug === auth.rosterId,
      ),
    [stages, isStudent, auth],
  );

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
      setError(err.message || 'Failed to load packs');
      setPacks([]);
    }
  }, [stageOnly]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    setTrackYs((prev) => {
      const next = [];
      for (let i = 0; i < trackCount; i++) {
        next.push(prev[i] != null ? prev[i] : i === 0 ? 330 : 280);
      }
      return next;
    });
  }, [trackCount]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!isStudent) {
      setError('Sign in as a student (settings gear) to upload.');
      return;
    }
    if (!online) {
      setError('Backend offline — uploads unavailable. Built-in stages still work in the game.');
      return;
    }
    if (!name.trim() || !file) {
      setError('Name and a PNG background are required.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const meta = {
        mode: 'single',
        width: 1024,
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
      // Persist tracks again after upload (upload may merge width).
      await updateGamePack(pack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
        meta: {
          ...meta,
          tracks: trackYs.map((y) => ({y: Number(y)})),
        },
      });
      setName('');
      setFile(null);
      await refresh();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(pack) {
    if (!isStudent || !window.confirm(`Delete "${pack.name}"?`)) return;
    setBusy(true);
    try {
      await deleteGamePack(pack.id, {
        rosterSlug: auth.rosterId,
        ownerName: auth.name,
      });
      await refresh();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  function testStageUrl(pack) {
    const params = new URLSearchParams({
      stage: pack.id,
    });
    return `/games/fighting-game-phaser/index.html?${params.toString()}`;
  }

  return (
    <section style={panelStyle}>
      <h2 style={{marginTop: 0}}>Stage workshop — background + tracks</h2>
      <p style={{marginBottom: '0.75rem'}}>
        Upload one PNG background and set where fighters stand (track lines). Backend{' '}
        <strong>{online == null ? '…' : online ? 'online' : 'offline'}</strong>
        {online === false
          ? ' — the game still runs with built-in maps.'
          : null}
      </p>
      {!isStudent ? (
        <p>
          Sign in as a <strong>student</strong> (编程 roster) via the settings gear to
          upload.
        </p>
      ) : (
        <p>
          Signed in as <strong>{auth.name}</strong> ({auth.rosterLabel || auth.rosterId}).
          Your stages: {mine.length}/10.
        </p>
      )}

      {error ? (
        <p style={{color: 'var(--ifm-color-danger)'}} role="alert">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleCreate}
        style={{display: 'grid', gap: '0.75rem', marginBottom: '1.25rem'}}
      >
        <label style={{display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.85rem'}}>
          Stage name
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            placeholder="My pixel stage"
          />
        </label>
        <label style={{display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.85rem'}}>
          Background PNG (ideally 1024×576)
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <label style={{display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.85rem'}}>
          Number of tracks
          <select
            style={inputStyle}
            value={trackCount}
            onChange={(e) => setTrackCount(Number(e.target.value))}
          >
            <option value={1}>1 track (ground)</option>
            <option value={2}>2 tracks (front / back lane)</option>
          </select>
        </label>
        {trackYs.map((y, index) => (
          <label
            key={index}
            style={{display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.85rem'}}
          >
            Track {index + 1} floor Y ({y})
            <input
              type="range"
              min={180}
              max={500}
              value={y}
              onChange={(e) => {
                const value = Number(e.target.value);
                setTrackYs((prev) => prev.map((item, i) => (i === index ? value : item)));
              }}
            />
          </label>
        ))}
        <TrackPreview imageUrl={previewUrl} trackYs={trackYs} />
        <button type="submit" style={buttonStyle} disabled={busy || !online || !isStudent}>
          {busy ? 'Uploading…' : 'Upload stage'}
        </button>
      </form>

      <h3>Class stages</h3>
      {!online && online != null ? (
        <p>Gallery unavailable while the API is offline.</p>
      ) : stages.length === 0 ? (
        <p>No student stages yet — be the first.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {stages.map((pack) => {
            const preview = packImageUrl(pack);
            const owned =
              isStudent &&
              pack.author === auth.name &&
              pack.rosterSlug === auth.rosterId;
            const ys = tracksFromMeta(pack.meta);
            return (
              <article
                key={pack.id}
                style={{
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: 8,
                  padding: '0.6rem',
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    style={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 4,
                      background: '#111',
                    }}
                  />
                ) : null}
                <div style={{fontWeight: 700, marginTop: 6}}>{pack.name}</div>
                <div style={{fontSize: '0.8rem', opacity: 0.85}}>
                  by {pack.author || 'unknown'} · tracks {ys.join(', ')}
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8}}>
                  <a href={testStageUrl(pack)} target="_blank" rel="noreferrer" style={secondaryBtn}>
                    Open in game
                  </a>
                  {owned ? (
                    <button
                      type="button"
                      style={secondaryBtn}
                      disabled={busy}
                      onClick={() => handleDelete(pack)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
