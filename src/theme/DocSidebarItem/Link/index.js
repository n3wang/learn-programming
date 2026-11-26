import React, {useMemo} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import {normalizePath} from '@site/src/data/lessonFlags/catalog';
import {capturedPaths} from '@site/src/data/lessonFlags/store';
import useLessonFlags from '@site/src/components/LessonFlags/useLessonFlags';

/**
 * Marks the sidebar item of a lesson whose flag is captured. The class goes on the `<li>`
 * (via `item.className`) — the original spreads extra props after its own `menu__link`
 * className, so a className prop would replace it.
 */
export default function DocSidebarItemLinkWrapper(props) {
  const {item} = props;
  const state = useLessonFlags();
  const paths = useMemo(() => capturedPaths(state), [state]);
  const captured = Boolean(item?.href) && paths.size > 0 && paths.has(normalizePath(item.href));
  if (!captured) {
    return <Link {...props} />;
  }
  const className = ['menu__list-item--flag-captured', item.className].filter(Boolean).join(' ');
  return <Link {...props} item={{...item, className}} title="Flag captured" />;
}
