import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {CITATIONS, DECKS, citationById, citationsForDeck, formatCitation} from '@site/src/data/citations/reliableAi';
import {RULES, extractCitationIds, scoreEssay} from './scoring';
import {getEssayStore} from './storage';
import {CitationCard, useEssayLabData} from './shared';
import styles from './styles.module.css';

const TABS = [
  {id: 'write', label: 'Write'},
  {id: 'citations', label: 'Citations'},
  {id: 'essays', label: 'My essays'},
];

function emptyDraft(deckId = DECKS[0].id) {
  const deck = DECKS.find((d) => d.id === deckId) || DECKS[0];
  return {id: null, deckId: deck.id, prompt: deck.prompts[0], title: '', body: '', status: 'draft'};
}

/** Renders essay text: paragraphs, with [@id] markers turned into numbered links and a reference list. */
function EssayView({body}) {
  const order = [];
  for (const id of extractCitationIds(body)) {
    if (citationById(id) && !order.includes(id)) {
      order.push(id);
    }
  }
  const paragraphs = String(body).split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <div className={styles.essayView}>
      {paragraphs.map((p, pi) => {
        const parts = [];
        let last = 0;
        for (const m of p.matchAll(/\[@([a-z0-9-]+(?:\s*;\s*@[a-z0-9-]+)*)\]/gi)) {
          parts.push(p.slice(last, m.index));
          const ids = m[1].split(';').map((s) => s.trim().replace(/^@/, '').toLowerCase());
          parts.push(
            <sup key={`${pi}-${m.index}`}>
              [
              {ids.map((id, i) => {
                const c = citationById(id);
                return (
                  <React.Fragment key={id}>
                    {i > 0 ? ', ' : ''}
                    {c ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" title={formatCitation(c)}>
                        {order.indexOf(id) + 1}
                      </a>
                    ) : (
                      <span className={styles.unknownCite} title="Unknown citation id">?{id}</span>
                    )}
                  </React.Fragment>
                );
              })}
              ]
            </sup>,
          );
          last = m.index + m[0].length;
        }
        parts.push(p.slice(last));
        return <p key={pi}>{parts}</p>;
      })}
      {order.length ? (
        <ol className={styles.refList}>
          {order.map((id) => {
            const c = citationById(id);
            return (
              <li key={id}>
                {formatCitation(c)}{' '}
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.url}
                </a>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

function toMarkdown(essay) {
  const order = [];
  for (const id of extractCitationIds(essay.body)) {
    if (citationById(id) && !order.includes(id)) {
      order.push(id);
    }
  }
  const body = essay.body.replace(/\[@([a-z0-9-]+(?:\s*;\s*@[a-z0-9-]+)*)\]/gi, (_, list) => {
    const nums = list
      .split(';')
      .map((s) => s.trim().replace(/^@/, '').toLowerCase())
      .map((id) => (order.includes(id) ? order.indexOf(id) + 1 : `?${id}`));
    return `[${nums.join(', ')}]`;
  });
  const refs = order.map((id, i) => `${i + 1}. ${formatCitation(citationById(id))} ${citationById(id).url}`).join('\n');
  return `# ${essay.title || 'Untitled essay'}\n\n> ${essay.prompt}\n\n${body}\n\n## References\n\n${refs}\n`;
}

function ScorePanel({score}) {
  return (
    <div className={styles.scorePanel}>
      <div className={styles.scoreTotal}>
        <span className={styles.scoreNumber}>{score.total}</span>
        <span>points</span>
      </div>
      {!score.eligible ? (
        <p className={styles.scoreNote}>
          {score.wordCount}/{RULES.minWords} words. Essays score once they reach {RULES.minWords} words.
        </p>
      ) : null}
      <ul className={styles.scoreItems}>
        {score.items.map((item) => (
          <li key={item.key}>
            <span>{item.label}</span>
            <span>+{item.points}</span>
          </li>
        ))}
        <li>
          <span>
            Deck coverage {Math.round(score.coverage * 100)}% (×{RULES.coverageMultiplier} at {Math.round(RULES.coverageThreshold * 100)}%)
          </span>
          <span>×{score.multiplier}</span>
        </li>
      </ul>
      {score.citations.locked.length ? (
        <p className={styles.scoreNote}>
          Locked (no points until you pass their quiz): {score.citations.locked.map((id) => `@${id}`).join(', ')}
        </p>
      ) : null}
      {score.citations.unknown.length ? (
        <p className={styles.scoreWarn}>Unknown citation ids: {score.citations.unknown.map((id) => `@${id}`).join(', ')}</p>
      ) : null}
    </div>
  );
}

function KeywordChips({deck, hits}) {
  return (
    <div className={styles.chips}>
      {deck.keywords.map((kw) => {
        const hit = hits[kw.id] || {};
        const cls = hit.citedBonus ? styles.chipBonus : hit.used ? styles.chipUsed : hit.fragmentOnly ? styles.chipFragment : '';
        const note = hit.citedBonus
          ? 'Used and backed by its source (+bonus)'
          : hit.used
            ? 'Used'
            : hit.fragmentOnly
              ? `Only in a fragment; use it in a sentence of ${RULES.minSentenceWords}+ words`
              : 'Not used yet';
        return (
          <span key={kw.id} className={`${styles.chip} ${cls}`} title={`${kw.definition}\n${note}`}>
            {kw.term}
          </span>
        );
      })}
    </div>
  );
}

function WriteTab({draft, setDraft, data, onSaved}) {
  const textRef = useRef(null);
  const [message, setMessage] = useState('');
  const deck = DECKS.find((d) => d.id === draft.deckId) || DECKS[0];
  const deckCitations = citationsForDeck(deck.id);
  const otherCitations = CITATIONS.filter((c) => !deckCitations.includes(c));
  const [showAll, setShowAll] = useState(false);
  const score = useMemo(() => scoreEssay(draft.body, deck, citationById, data.progress), [draft.body, deck, data.progress]);

  function insertCitation(id) {
    const el = textRef.current;
    const marker = `[@${id}]`;
    const start = el ? el.selectionStart : draft.body.length;
    const end = el ? el.selectionEnd : draft.body.length;
    const before = draft.body.slice(0, start);
    const spacer = before && !/\s$/.test(before) ? ' ' : '';
    const body = `${before}${spacer}${marker}${draft.body.slice(end)}`;
    setDraft({...draft, body});
    requestAnimationFrame(() => {
      if (el) {
        const pos = start + spacer.length + marker.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  }

  async function save(status) {
    const existing = data.essays.find((e) => e.id === draft.id);
    const saved = await getEssayStore().saveEssay({
      ...existing,
      ...draft,
      status,
      score: score.total,
      scoreBreakdown: score,
      rulesVersion: score.rulesVersion,
    });
    setDraft({...draft, id: saved.id, status: saved.status});
    setMessage(status === 'published' ? 'Published to your gallery.' : 'Draft saved in this browser.');
    onSaved?.();
  }

  const citationList = showAll ? [...deckCitations, ...otherCitations] : deckCitations;

  return (
    <div className={styles.writeGrid}>
      <div className={styles.editorCol}>
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Deck</span>
            <select
              value={deck.id}
              onChange={(e) => {
                const next = DECKS.find((d) => d.id === e.target.value);
                setDraft({...draft, deckId: next.id, prompt: next.prompts[0]});
              }}>
              {DECKS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Prompt</span>
            <select value={draft.prompt} onChange={(e) => setDraft({...draft, prompt: e.target.value})}>
              {deck.prompts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className={styles.prompt}>{draft.prompt}</p>
        {deck.lesson ? (
          <p className={styles.small}>
            Review the lesson: <Link to={deck.lesson}>{deck.title}</Link>
          </p>
        ) : null}

        <h4 className={styles.subhead}>Target keywords</h4>
        <KeywordChips deck={deck} hits={score.keywordHits} />

        <label className={styles.field}>
          <span>Title</span>
          <input type="text" value={draft.title} onChange={(e) => setDraft({...draft, title: e.target.value})} placeholder="Give your essay a title" />
        </label>
        <label className={styles.field}>
          <span>
            Essay ({score.wordCount} words). Cite with <code>[@citation-id]</code> or <code>[@id-one; @id-two]</code>
          </span>
          <textarea
            ref={textRef}
            className={styles.textarea}
            value={draft.body}
            onChange={(e) => setDraft({...draft, body: e.target.value})}
            placeholder="Write your argument. Use the target keywords in full sentences, and cite the sources that back your claims."
            rows={16}
          />
        </label>
        <div className={styles.row}>
          <button type="button" className="button button--secondary" onClick={() => save('draft')}>
            Save draft
          </button>
          <button type="button" className="button button--primary" onClick={() => save('published')} disabled={!score.eligible || !draft.title.trim()}>
            Publish
          </button>
          <button
            type="button"
            className="button button--link"
            onClick={() => {
              setDraft(emptyDraft(deck.id));
              setMessage('');
            }}>
            New essay
          </button>
          {message ? <span className={styles.small}>{message}</span> : null}
        </div>
        {draft.body.trim() ? (
          <details className={styles.preview}>
            <summary>Preview</summary>
            <EssayView body={draft.body} />
          </details>
        ) : null}
      </div>

      <div className={styles.sideCol}>
        <ScorePanel score={score} />
        <h4 className={styles.subhead}>Citations</h4>
        <p className={styles.small}>Pass a citation's quiz to unlock it. Locked citations can be cited but earn no points.</p>
        {citationList.map((c) => (
          <CitationCard
            key={c.id}
            citation={c}
            progress={data.progress[c.id]}
            action={
              <button type="button" className="button button--outline button--primary button--sm" onClick={() => insertCitation(c.id)}>
                Insert
              </button>
            }
          />
        ))}
        <button type="button" className="button button--link button--sm" onClick={() => setShowAll((s) => !s)}>
          {showAll ? 'Show only this deck\'s citations' : `Show all ${CITATIONS.length} citations`}
        </button>
      </div>
    </div>
  );
}

function CitationsTab({data}) {
  const [filter, setFilter] = useState('all');
  const chapters = [...new Set(CITATIONS.map((c) => c.chapter))];
  const unlocked = CITATIONS.filter((c) => data.progress[c.id]?.unlockedAt).length;
  const list = CITATIONS.filter((c) => {
    if (filter === 'locked') {
      return !data.progress[c.id]?.unlockedAt;
    }
    if (filter === 'all') {
      return true;
    }
    return String(c.chapter) === filter;
  });
  return (
    <div>
      <div className={styles.row}>
        <span className={styles.small}>
          {unlocked}/{CITATIONS.length} unlocked
        </span>
        <label className={styles.field}>
          <span>Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All citations</option>
            <option value="locked">Still locked</option>
            {chapters.map((ch) => {
              const deck = DECKS.find((d) => d.chapter === ch);
              return (
                <option key={ch} value={String(ch)}>
                  {deck ? deck.title : `Chapter ${ch}`}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      {list.map((c) => (
        <CitationCard key={c.id} citation={c} progress={data.progress[c.id]} />
      ))}
    </div>
  );
}

function EssaysTab({data, onOpen}) {
  const [viewing, setViewing] = useState(null);
  const [copied, setCopied] = useState(null);
  const store = getEssayStore();

  if (!data.essays.length) {
    return <p>No essays yet. Write one in the Write tab; drafts and published essays are saved in this browser.</p>;
  }
  const sorted = [...data.essays].sort((a, b) => (data.votes[b.id]?.score || 0) - (data.votes[a.id]?.score || 0) || (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <div>
      <p className={styles.small}>
        Personal mode: essays and votes live in this browser only. Voting works the same way it will in a shared gallery.
      </p>
      {sorted.map((e) => {
        const v = data.votes[e.id] || {score: 0, mine: 0};
        const deck = DECKS.find((d) => d.id === e.deckId);
        return (
          <div key={e.id} className={styles.essayRow}>
            <div className={styles.votes}>
              <button type="button" className={`${styles.voteBtn} ${v.mine === 1 ? styles.voteOn : ''}`} aria-label="Upvote" onClick={() => store.vote(e.id, v.mine === 1 ? 0 : 1)}>
                ▲
              </button>
              <span>{v.score}</span>
              <button type="button" className={`${styles.voteBtn} ${v.mine === -1 ? styles.voteOn : ''}`} aria-label="Downvote" onClick={() => store.vote(e.id, v.mine === -1 ? 0 : -1)}>
                ▼
              </button>
            </div>
            <div className={styles.essayInfo}>
              <div className={styles.essayTitle}>
                {e.title || 'Untitled essay'}{' '}
                <span className={`${styles.status} ${e.status === 'published' ? styles.statusUnlocked : ''}`}>{e.status}</span>
              </div>
              <div className={styles.small}>
                {deck ? deck.title : e.deckId} · {e.score ?? 0} points · {e.authorName || 'Anonymous'} · {new Date(e.updatedAt).toLocaleDateString()}
              </div>
              <div className={styles.row}>
                <button type="button" className="button button--sm button--secondary" onClick={() => setViewing(viewing === e.id ? null : e.id)}>
                  {viewing === e.id ? 'Hide' : 'Read'}
                </button>
                <button type="button" className="button button--sm button--secondary" onClick={() => onOpen(e)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="button button--sm button--secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(toMarkdown(e));
                      setCopied(e.id);
                    } catch {
                      setCopied(null);
                    }
                  }}>
                  {copied === e.id ? 'Copied' : 'Copy as Markdown'}
                </button>
                <button
                  type="button"
                  className="button button--sm button--link"
                  onClick={() => {
                    if (window.confirm('Delete this essay from this browser?')) {
                      store.deleteEssay(e.id);
                    }
                  }}>
                  Delete
                </button>
              </div>
              {viewing === e.id ? (
                <div className={styles.readBox}>
                  <h3>{e.title || 'Untitled essay'}</h3>
                  <p className={styles.prompt}>{e.prompt}</p>
                  <EssayView body={e.body} />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EssayLab() {
  const data = useEssayLabData();
  const [tab, setTab] = useState('write');
  const [draft, setDraft] = useState(() => emptyDraft());
  const [name, setName] = useState('');

  useEffect(() => {
    if (data.player) {
      setName(data.player.displayName || '');
    }
  }, [data.player]);

  if (!data.ready) {
    return <p>Loading…</p>;
  }
  if (data.error) {
    return <p className={styles.scoreWarn}>The Essay Lab needs browser storage (IndexedDB), which isn't available here: {data.error}</p>;
  }

  return (
    <div className={styles.lab}>
      <div className={styles.labHead}>
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.id === 'essays' && data.essays.length ? ` (${data.essays.length})` : ''}
            </button>
          ))}
        </div>
        <label className={styles.nameField}>
          <span>Pen name</span>
          <input
            type="text"
            value={name}
            placeholder="Anonymous"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => getEssayStore().setDisplayName(name)}
          />
        </label>
      </div>

      {tab === 'write' ? <WriteTab draft={draft} setDraft={setDraft} data={data} /> : null}
      {tab === 'citations' ? <CitationsTab data={data} /> : null}
      {tab === 'essays' ? (
        <EssaysTab
          data={data}
          onOpen={(e) => {
            setDraft({id: e.id, deckId: e.deckId, prompt: e.prompt, title: e.title, body: e.body, status: e.status});
            setTab('write');
          }}
        />
      ) : null}

      <details className={styles.rules}>
        <summary>How scoring works</summary>
        <ul>
          <li>+{RULES.keywordPoints} for each target keyword used in a sentence of at least {RULES.minSentenceWords} words (counted once per keyword).</li>
          <li>+{RULES.keywordCitedBonus} when that sentence also cites an unlocked source that teaches the keyword.</li>
          <li>+{RULES.citationPoints} per distinct unlocked citation (up to {RULES.maxScoredCitations}), and +{RULES.firstTryBonus} more if you passed its quiz on the first try.</li>
          <li>+{RULES.synthesisPoints} per sentence that cites two or more unlocked sources (up to {RULES.maxSynthesisSentences}).</li>
          <li>×{RULES.coverageMultiplier} when you use at least {Math.round(RULES.coverageThreshold * 100)}% of the deck's keywords.</li>
          <li>Essays under {RULES.minWords} words score 0. Repeating a keyword or listing keywords earns nothing extra.</li>
          <li>Quality is judged by votes, not by the score: the score rewards using the vocabulary and the sources.</li>
        </ul>
      </details>
    </div>
  );
}

