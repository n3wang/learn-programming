import React, {useState} from 'react';
import {useLocation} from '@docusaurus/router';
import {useHomeworkDraftMode} from '@site/src/components/homework/useHomeworkDraftMode';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import {appendProblemToHomeworkDraft} from '@site/src/data/homeworkDraftSession';

/**
 * Button shown beside 显示解答 when homework draft mode is on (admin only).
 * `getPayload` may be sync or async and should return { title, prompt, answer }.
 */
export default function DraftHomeworkButton({getPayload, label = '加入作业'}) {
  const {active} = useHomeworkDraftMode();
  const {isAdmin} = useSiteAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState('');

  if (!isAdmin || !active) {
    return null;
  }

  const onClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) {
      return;
    }
    setBusy(true);
    setFlash('');
    try {
      const payload =
        typeof getPayload === 'function' ? await getPayload() : getPayload;
      if (!payload || (!payload.prompt && !payload.answer)) {
        setFlash('empty');
        return;
      }
      const next = await appendProblemToHomeworkDraft({
        ...payload,
        sourcePath:
          payload.sourcePath ||
          `${location?.pathname || ''}${location?.search || ''}`,
      });
      setFlash(`#${next.problemCount}`);
      window.setTimeout(() => setFlash(''), 1600);
    } catch {
      setFlash('err');
      window.setTimeout(() => setFlash(''), 1600);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="button button--sm button--secondary"
      onClick={onClick}
      disabled={busy}
      title="Copy this problem into today’s HW prompt + answer notes"
      style={{flexShrink: 0}}
    >
      {busy ? '…' : flash === 'err' ? 'Failed' : flash === 'empty' ? 'Empty' : flash || label}
    </button>
  );
}

/** Extract readable text from a DOM node (math problems, solutions). */
export function textFromNode(node) {
  if (!node) {
    return '';
  }
  try {
    // Prefer textContent so hidden solution nodes (display:none) still copy.
    return String(node.textContent || node.innerText || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } catch {
    return '';
  }
}
