/**
 * Ejected from @docusaurus/theme-classic 3.10.2 (DocRoot/Layout/Sidebar).
 * Only change: when the page is opened with shareable-link query params
 * (?course=… or ?student=…, e.g. the 成绩 report links sent to parents)
 * the doc sidebar starts collapsed. The expand arrow still opens it.
 */
import React, {useCallback, useEffect, useState} from 'react';
import clsx from 'clsx';
import {prefersReducedMotion, ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import DocSidebar from '@theme/DocSidebar';
import ExpandButton from '@theme/DocRoot/Layout/Sidebar/ExpandButton';
import styles from './styles.module.css';

const HIDE_SIDEBAR_PARAMS = ['course', 'student'];

// Reset sidebar state when sidebar changes
// Use React key to unmount/remount the children
// See https://github.com/facebook/docusaurus/issues/3414
function ResetOnSidebarChange({children}) {
  const sidebar = useDocsSidebar();
  return <React.Fragment key={sidebar?.name ?? 'noSidebar'}>{children}</React.Fragment>;
}

export default function DocRootLayoutSidebar({sidebar, hiddenSidebarContainer, setHiddenSidebarContainer}) {
  const {pathname, search} = useLocation();
  const [hiddenSidebar, setHiddenSidebar] = useState(false);

  // Collapse straight away (no slide animation) when opened from a shared link.
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (HIDE_SIDEBAR_PARAMS.some((key) => params.has(key))) {
      setHiddenSidebar(true);
      setHiddenSidebarContainer(true);
    }
    // Only on first load — later replaceState updates must not re-collapse it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }
    // onTransitionEnd won't fire when sidebar animation is disabled
    // fixes https://github.com/facebook/docusaurus/issues/8918
    if (!hiddenSidebar && prefersReducedMotion()) {
      setHiddenSidebar(true);
    }
    setHiddenSidebarContainer((value) => !value);
  }, [setHiddenSidebarContainer, hiddenSidebar]);

  return (
    <aside
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
        hiddenSidebarContainer && styles.docSidebarContainerHidden,
      )}
      onTransitionEnd={(e) => {
        if (!e.currentTarget.classList.contains(styles.docSidebarContainer)) {
          return;
        }
        if (hiddenSidebarContainer) {
          setHiddenSidebar(true);
        }
      }}
    >
      <ResetOnSidebarChange>
        <div className={clsx(styles.sidebarViewport, hiddenSidebar && styles.sidebarViewportHidden)}>
          <DocSidebar sidebar={sidebar} path={pathname} onCollapse={toggleSidebar} isHidden={hiddenSidebar} />
          {hiddenSidebar && <ExpandButton toggleSidebar={toggleSidebar} />}
        </div>
      </ResetOnSidebarChange>
    </aside>
  );
}
