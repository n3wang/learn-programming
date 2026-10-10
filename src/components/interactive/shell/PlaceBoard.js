import React, { useRef, useState } from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';

function shuffle(ids) {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function chipKey(chip) {
  return chip.group || chip.id;
}

function slotIds(page) {
  const ids = [];
  page.rows.forEach((row) => {
    if (!row.given && row.answer) ids.push(row.id);
    if (row.paren && !row.paren.given && row.paren.answer) ids.push(`${row.id}:paren`);
  });
  return ids;
}

function emptySlots(page) {
  return Object.fromEntries(slotIds(page).map((id) => [id, null]));
}

/**
 * Drag or tap chips from a bank into blanks.
 *
 * pages: [{
 *   lead, note,
 *   chips: [{ id, label, detail, group }],
 *   rows: [{
 *     id, marker, left, right, follow, sentence,
 *     given: { label, detail },
 *     answer, hint,
 *     paren: { answer, hint, given: { label, detail } },
 *   }],
 * `sentence` renders “……得 [blank] （性质）” instead of a left/right comparison.
 * }]
 * A slot is correct when the placed chip's group (or id) matches answer.
 */
export default function PlaceBoard({ pages, bankLabel = '可选', title }) {
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const [bankOrder, setBankOrder] = useState(() => shuffle(pages[0].chips.map((chip) => chip.id)));
  const [slots, setSlots] = useState(() => emptySlots(pages[0]));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const chipById = Object.fromEntries(page.chips.map((chip) => [chip.id, chip]));
  const openIds = slotIds(page);
  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = bankOrder.filter((id) => chipById[id] && !placed.has(id));
  const hasParen = page.rows.some((row) => row.paren);
  const allPlaced = openIds.every((id) => slots[id]);
  const allCorrect = allPlaced && page.rows.every((row) => rowCorrect(row, slots, chipById));

  function load(nextIndex) {
    const next = pages[nextIndex];
    setIndex(nextIndex);
    setSlots(emptySlots(next));
    setActiveSlot(null);
    setChecked(false);
    setBankOrder(shuffle(next.chips.map((chip) => chip.id)));
  }

  function moveChip(chipId, slotId) {
    setSlots((prev) => {
      const next = { ...prev };
      const fromSlot = Object.keys(next).find((key) => next[key] === chipId);
      const displaced = next[slotId];
      if (fromSlot && fromSlot !== slotId) next[fromSlot] = displaced || null;
      next[slotId] = chipId;
      return next;
    });
    setChecked(false);
    setActiveSlot(null);
  }

  function returnChip(chipId) {
    setSlots((prev) => {
      const next = { ...prev };
      const fromSlot = Object.keys(next).find((key) => next[key] === chipId);
      if (fromSlot) next[fromSlot] = null;
      return next;
    });
    setChecked(false);
  }

  function placeFromBank(chipId) {
    const target =
      (activeSlot && !slots[activeSlot] && activeSlot) ||
      openIds.find((id) => !slots[id]);
    if (!target) return;
    moveChip(chipId, target);
  }

  function onDropSlot(event, slotId) {
    event.preventDefault();
    const chipId = event.dataTransfer.getData('text/plain');
    if (!chipById[chipId]) return;
    moveChip(chipId, slotId);
  }

  return (
    <CEBlock
      title={title || `例 ${index + 1} / ${pages.length}`}
      subtitle={page.note || '把下面的卡片拖进空位，或点一下放进去。再点已放入的卡片，可以拿回来。'}
    >
      {page.lead ? <p style={{ marginTop: 0 }}>{page.lead}</p> : null}
      <div style={{ display: 'grid', gap: 10 }}>
        {page.rows.map((row) => (
          <RowView
            key={row.id}
            row={row}
            hasParen={hasParen}
            slots={slots}
            chipById={chipById}
            checked={checked}
            activeSlot={activeSlot}
            onSelect={setActiveSlot}
            onDropSlot={onDropSlot}
            onReturn={returnChip}
          />
        ))}
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const chipId = event.dataTransfer.getData('text/plain');
          if (chipById[chipId]) returnChip(chipId);
        }}
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          background: 'var(--ifm-color-emphasis-100)',
          minHeight: 84,
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>
          {bankLabel}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bank.map((id) => (
            <ChipButton key={id} chip={chipById[id]} onClick={() => placeFromBank(id)} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" onClick={() => setChecked(true)} style={actionBtn}>检查</button>
        <button type="button" onClick={() => load(index)} style={actionBtn}>重来</button>
        {index > 0 ? (
          <button type="button" onClick={() => load(index - 1)} style={actionBtn}>上一题</button>
        ) : null}
        {index < pages.length - 1 ? (
          <button type="button" onClick={() => load(index + 1)} style={actionBtn}>下一题</button>
        ) : null}
        {checked && allCorrect ? <span>这一题放对了。</span> : null}
        {checked && !allPlaced ? <span>还有空位。</span> : null}
      </div>
    </CEBlock>
  );
}

function rowCorrect(row, slots, chipById) {
  const middleOk = row.given || !row.answer || matches(slots[row.id], row.answer, chipById);
  const parenOk = !row.paren || row.paren.given || matches(slots[`${row.id}:paren`], row.paren.answer, chipById);
  return middleOk && parenOk;
}

function matches(chipId, answer, chipById) {
  if (!chipId || !chipById[chipId]) return false;
  return chipKey(chipById[chipId]) === answer;
}

function RowView({ row, hasParen, slots, chipById, checked, activeSlot, onSelect, onDropSlot, onReturn }) {
  const middleId = row.id;
  const parenId = `${row.id}:paren`;
  const middleBad = checked && !row.given && row.answer && !matches(slots[middleId], row.answer, chipById);
  const parenBad = checked && row.paren && !row.paren.given && !matches(slots[parenId], row.paren.answer, chipById);
  const hints = (
    <>
      {middleBad && slots[middleId] && row.hint ? <Hint>{row.hint}</Hint> : null}
      {parenBad && slots[parenId] && row.paren?.hint ? <Hint>{row.paren.hint}</Hint> : null}
    </>
  );
  if (row.sentence) {
    return (
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, lineHeight: 1.45 }}>
          <div style={{ minWidth: '3.2rem' }}>{row.marker}</div>
          <div>{row.sentence}</div>
          {row.given ? (
            <Filled chip={{ label: row.given.label, detail: row.given.detail }} />
          ) : (
            <Slot
              slotId={middleId}
              chip={slots[middleId] ? chipById[slots[middleId]] : null}
              selected={activeSlot === middleId && !slots[middleId]}
              ok={checked && row.answer && matches(slots[middleId], row.answer, chipById)}
              bad={middleBad && Boolean(slots[middleId])}
              placeholder="得"
              onSelect={() => onSelect(middleId)}
              onDrop={onDropSlot}
              onReturn={onReturn}
            />
          )}
          {row.paren ? (
            row.paren.given ? (
              <Filled chip={{ label: row.paren.given.label, detail: row.paren.given.detail }} paren />
            ) : (
              <Slot
                slotId={parenId}
                chip={slots[parenId] ? chipById[slots[parenId]] : null}
                selected={activeSlot === parenId && !slots[parenId]}
                ok={checked && matches(slots[parenId], row.paren.answer, chipById)}
                bad={parenBad && Boolean(slots[parenId])}
                placeholder="性质"
                paren
                onSelect={() => onSelect(parenId)}
                onDrop={onDropSlot}
                onReturn={onReturn}
              />
            )
          ) : null}
        </div>
        {hints}
      </div>
    );
  }
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasParen
            ? '3.2rem minmax(88px, 1fr) auto minmax(88px, 1fr) auto'
            : '3.2rem minmax(72px, 1fr) auto minmax(72px, 1fr)',
          alignItems: 'center',
          gap: 8,
          paddingLeft: row.follow ? 12 : 0,
        }}
      >
        <div style={{ color: row.follow ? 'var(--ifm-color-emphasis-700)' : 'inherit' }}>{row.marker}</div>
        <div style={sideStyle}>{row.left}</div>
        {row.given ? (
          <Filled chip={{ label: row.given.label, detail: row.given.detail }} />
        ) : (
          <Slot
            slotId={middleId}
            chip={slots[middleId] ? chipById[slots[middleId]] : null}
            selected={activeSlot === middleId && !slots[middleId]}
            ok={checked && row.answer && matches(slots[middleId], row.answer, chipById)}
            bad={middleBad && Boolean(slots[middleId])}
            placeholder="放这里"
            onSelect={() => onSelect(middleId)}
            onDrop={onDropSlot}
            onReturn={onReturn}
          />
        )}
        <div style={{ ...sideStyle, textAlign: 'left' }}>{row.right}</div>
        {hasParen ? (
          row.paren ? (
            row.paren.given ? (
              <Filled chip={{ label: row.paren.given.label, detail: row.paren.given.detail }} paren />
            ) : (
              <Slot
                slotId={parenId}
                chip={slots[parenId] ? chipById[slots[parenId]] : null}
                selected={activeSlot === parenId && !slots[parenId]}
                ok={checked && matches(slots[parenId], row.paren.answer, chipById)}
                bad={parenBad && Boolean(slots[parenId])}
                placeholder="性质"
                paren
                onSelect={() => onSelect(parenId)}
                onDrop={onDropSlot}
                onReturn={onReturn}
              />
            )
          ) : <span />
        ) : null}
      </div>
      {hints}
    </div>
  );
}

function Slot({ slotId, chip, selected, ok, bad, placeholder, paren, onSelect, onDrop, onReturn }) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, slotId)}
      onClick={() => {
        if (!chip) onSelect();
      }}
      style={{
        minWidth: paren ? 112 : 132,
        minHeight: paren ? 56 : 64,
        borderRadius: 10,
        border: `2px ${chip ? 'solid' : 'dashed'} ${
          ok ? '#2e7d32' : bad ? '#c62828' : selected ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)'
        }`,
        background: ok ? 'rgba(46,125,50,0.12)' : bad ? 'rgba(198,40,40,0.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        cursor: chip ? 'default' : 'pointer',
      }}
    >
      {chip ? (
        <ChipButton chip={chip} onClick={() => onReturn(chip.id)} />
      ) : (
        <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.9rem' }}>
          {selected ? '点下面的卡片' : placeholder}
        </span>
      )}
    </div>
  );
}

function Filled({ chip, paren }) {
  return (
    <div
      style={{
        minWidth: paren ? 112 : 132,
        textAlign: 'center',
        lineHeight: 1.3,
        padding: '8px 10px',
        borderRadius: 10,
        background: 'var(--ifm-color-emphasis-100)',
      }}
    >
      <div style={{ fontSize: chip.detail ? '1.05rem' : '1.15rem', fontWeight: 700 }}>{chip.label}</div>
      {chip.detail ? <div style={{ fontSize: '0.82rem' }}>{chip.detail}</div> : null}
    </div>
  );
}

function ChipButton({ chip, onClick }) {
  const dragged = useRef(false);
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        dragged.current = true;
        event.dataTransfer.setData('text/plain', chip.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onClick();
      }}
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 10,
        background: 'var(--ifm-background-surface-color, var(--ifm-background-color))',
        padding: '6px 10px',
        cursor: 'grab',
        font: 'inherit',
        textAlign: 'center',
        lineHeight: 1.25,
      }}
    >
      <div style={{ fontSize: chip.detail ? '1rem' : '1.15rem', fontWeight: 700 }}>{chip.label}</div>
      {chip.detail ? (
        <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-700)' }}>{chip.detail}</div>
      ) : null}
    </button>
  );
}

function Hint({ children }) {
  return (
    <div style={{ textAlign: 'center', color: '#c62828', fontSize: '0.9rem', marginTop: 4 }}>
      {children}
    </div>
  );
}

const sideStyle = {
  textAlign: 'right',
  fontSize: '1.05rem',
};

const actionBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
  font: 'inherit',
};
