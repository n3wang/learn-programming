import React, {useCallback, useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {CARDS, localizeCard} from '@site/src/data/cards';
import {answerVariants} from '@site/src/components/ScratchNotes/cardMatch';
import {UI_LANG_CHANGE_EVENT, readUiLang} from '@site/src/components/Translate/translateClient';
import {TERM_PEEK_CHANGE_EVENT, readTermPeekEnabled} from './settings';
import styles from './styles.module.css';

const HIDE_AFTER_SHIFT_MS = 900;
const CJK = /[㐀-鿿]/;

/** Hover-translate language → card locale. Cards have en + zh-Hans; anything else falls back to en. */
function cardLocale(uiLang) {
  return uiLang === 'zh-CN' ? 'zh-Hans' : 'en';
}

/** Every spelling we look for in page text, longest first so “Bill of lading” beats “Bill”. */
function buildPatterns() {
  const rows = [];
  const seen = new Set();
  CARDS.forEach((card) => {
    const names = [card.term, card.translations?.['zh-Hans']?.term, ...(card.aliases || [])].filter(Boolean);
    names.forEach((name) => {
      answerVariants(name).forEach((variant) => {
        const text = variant.replace(/[®™]/g, '').trim();
        const key = `${text.toLowerCase()}|${card.id}`;
        // Skip one-letter and purely numeric spellings: too many false hits in prose.
        if (text.length < 2 || /^\d+$/.test(text) || seen.has(key)) {
          return;
        }
        seen.add(key);
        rows.push({text: text.toLowerCase(), cjk: CJK.test(text), card});
      });
    });
  });
  return rows.sort((a, b) => b.text.length - a.text.length);
}

let PATTERNS = null;

/** “/fundamentals/international-business/export-import/x” → first three segments. */
function sectionOf(path) {
  return String(path || '')
    .replace(/^\/zh-Hans(?=\/)/, '')
    .split('/')
    .filter(Boolean)
    .slice(0, 3)
    .join('/');
}

function isWordChar(ch) {
  return Boolean(ch) && /[\p{L}\p{N}]/u.test(ch) && !CJK.test(ch);
}

/**
 * Card whose name occurs in `text` around character `offset`, if any. Only cards from
 * the section being read count, so “Process” in a business lesson is not an OS term.
 */
function termAt(text, offset, section) {
  if (!PATTERNS) {
    PATTERNS = buildPatterns();
  }
  const lower = text.toLowerCase();
  for (const row of PATTERNS) {
    if (row.card.link && sectionOf(row.card.link) !== section) {
      continue;
    }
    let from = Math.max(0, offset - row.text.length);
    for (;;) {
      const i = lower.indexOf(row.text, from);
      if (i === -1 || i > offset) {
        break;
      }
      const end = i + row.text.length;
      // Also accept a plain plural: “invoice” matches “invoices”.
      const after = lower[end] === 's' && !isWordChar(lower[end + 1]) ? lower[end + 1] : lower[end];
      const bounded = row.cjk || (!isWordChar(lower[i - 1]) && !isWordChar(after));
      if (offset >= i && offset <= end + 1 && bounded) {
        return row.card;
      }
      from = i + 1;
    }
  }
  return null;
}

function caretAt(x, y) {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    return pos ? {node: pos.offsetNode, offset: pos.offset} : null;
  }
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    return range ? {node: range.startContainer, offset: range.startOffset} : null;
  }
  return null;
}

/**
 * Shift + hover over a glossary term in lesson text shows its card: icon, term and
 * definition in the hover-translate language. Off by default (site settings).
 */
export default function TermPeek() {
  const [enabled, setEnabled] = useState(false);
  const [uiLang, setUiLang] = useState('zh-CN');
  const [peek, setPeek] = useState(null);
  const pointer = useRef({x: 0, y: 0});
  const shiftDown = useRef(false);
  const overCard = useRef(false);
  const hideTimer = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    setEnabled(readTermPeekEnabled());
    setUiLang(readUiLang());
    const onToggle = (e) => setEnabled(Boolean(e.detail?.enabled));
    const onLang = () => setUiLang(readUiLang());
    window.addEventListener(TERM_PEEK_CHANGE_EVENT, onToggle);
    window.addEventListener(UI_LANG_CHANGE_EVENT, onLang);
    return () => {
      window.removeEventListener(TERM_PEEK_CHANGE_EVENT, onToggle);
      window.removeEventListener(UI_LANG_CHANGE_EVENT, onLang);
    };
  }, []);

  const lookup = useCallback(() => {
    const {x, y} = pointer.current;
    const el = document.elementFromPoint(x, y);
    if (!el || cardRef.current?.contains(el)) {
      return;
    }
    // Lesson prose only — not the navbar, sidebars, or the notes dock.
    if (!el.closest('article') || el.closest('nav, aside, [aria-label="Scratch notes"]')) {
      return;
    }
    const caret = caretAt(x, y);
    if (!caret || caret.node?.nodeType !== Node.TEXT_NODE) {
      return;
    }
    const card = termAt(caret.node.textContent || '', caret.offset, sectionOf(window.location.pathname));
    if (card) {
      window.clearTimeout(hideTimer.current);
      setPeek((prev) => (prev?.card.id === card.id ? prev : {card, x, y}));
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setPeek(null);
      return undefined;
    }
    let frame = 0;
    const onMove = (e) => {
      pointer.current = {x: e.clientX, y: e.clientY};
      shiftDown.current = e.shiftKey;
      if (e.shiftKey && !frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          lookup();
        });
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Shift' && !e.repeat) {
        shiftDown.current = true;
        lookup();
      } else if (e.key === 'Escape') {
        setPeek(null);
      }
    };
    const onKeyUp = (e) => {
      if (e.key !== 'Shift') {
        return;
      }
      shiftDown.current = false;
      // Leave a moment to move onto the card (e.g. to click “Open lesson”).
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        if (!overCard.current) {
          setPeek(null);
        }
      }, HIDE_AFTER_SHIFT_MS);
    };
    const onScroll = () => setPeek(null);
    window.addEventListener('mousemove', onMove, {passive: true});
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, lookup]);

  if (!enabled || !peek) {
    return null;
  }

  const locale = cardLocale(uiLang);
  const shown = localizeCard(peek.card, locale);
  const otherTerm = locale === 'en' ? peek.card.translations?.['zh-Hans']?.term : peek.card.term;
  // Keep the card on screen: open below-right of the pointer, flip when near an edge.
  const width = 300;
  const left = Math.min(peek.x + 14, window.innerWidth - width - 12);
  const below = peek.y < window.innerHeight * 0.6;
  const style = below
    ? {left, top: peek.y + 18, width}
    : {left, bottom: window.innerHeight - peek.y + 14, width};

  return (
    <div
      ref={cardRef}
      className={styles.peek}
      style={style}
      role="dialog"
      aria-label={`Term: ${shown.term}`}
      onMouseEnter={() => {
        overCard.current = true;
        window.clearTimeout(hideTimer.current);
      }}
      onMouseLeave={() => {
        overCard.current = false;
        if (!shiftDown.current) {
          setPeek(null);
        }
      }}>
      <div className={styles.head}>
        {peek.card.image ? (
          <img
            className={styles.icon}
            src={peek.card.image}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div className={styles.titles}>
          <div className={styles.term}>{shown.term}</div>
          {otherTerm && otherTerm !== shown.term ? <div className={styles.other}>{otherTerm}</div> : null}
        </div>
      </div>
      <p className={styles.definition}>{shown.definition}</p>
      {peek.card.example ? <p className={styles.example}>{peek.card.example}</p> : null}
      {peek.card.link ? (
        <Link className={styles.link} to={peek.card.link} onClick={() => setPeek(null)}>
          Open lesson
        </Link>
      ) : null}
    </div>
  );
}
