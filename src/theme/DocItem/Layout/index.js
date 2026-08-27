import React, {useCallback, useState} from 'react';
import clsx from 'clsx';
import {useWindowSize} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Unlisted from '@theme/Unlisted';
import IconArrow from '@theme/Icon/Arrow';

import styles from './styles.module.css';

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const {frontMatter, toc} = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

function CollapseTocButton({onClick}) {
  return (
    <button
      type="button"
      title={translate({
        id: 'theme.docs.toc.collapseButtonTitle',
        message: 'Collapse table of contents',
        description:
          'The title attribute for collapse button of the doc TOC sidebar',
      })}
      aria-label={translate({
        id: 'theme.docs.toc.collapseButtonAriaLabel',
        message: 'Collapse table of contents',
        description:
          'The ARIA label for collapse button of the doc TOC sidebar',
      })}
      className={styles.collapseTocButton}
      onClick={onClick}>
      <IconArrow className={styles.collapseTocButtonIcon} />
    </button>
  );
}

function ExpandTocButton({onClick}) {
  return (
    <div
      className={styles.expandTocButton}
      title={translate({
        id: 'theme.docs.toc.expandButtonTitle',
        message: 'Expand table of contents',
        description:
          'The ARIA label and title attribute for expand button of the doc TOC',
      })}
      aria-label={translate({
        id: 'theme.docs.toc.expandButtonAriaLabel',
        message: 'Expand table of contents',
        description:
          'The ARIA label and title attribute for expand button of the doc TOC',
      })}
      tabIndex={0}
      role="button"
      onKeyDown={onClick}
      onClick={onClick}>
      <IconArrow className={styles.expandTocButtonIcon} />
    </div>
  );
}

export default function DocItemLayout({children}) {
  const docTOC = useDocTOC();
  const {
    metadata: {unlisted},
  } = useDoc();
  const [hiddenTocContainer, setHiddenTocContainer] = useState(false);
  const toggleToc = useCallback(() => {
    setHiddenTocContainer((value) => !value);
  }, []);

  const showDesktopToc = Boolean(docTOC.desktop) && !hiddenTocContainer;

  return (
    <div className={clsx('row', styles.docItemRow)}>
      <div className={clsx('col', showDesktopToc && styles.docItemCol)}>
        {unlisted && <Unlisted />}
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {showDesktopToc && (
        <div className={clsx('col', 'col--3', styles.tocColumn)}>
          <CollapseTocButton onClick={toggleToc} />
          {docTOC.desktop}
        </div>
      )}
      {docTOC.desktop && hiddenTocContainer && (
        <ExpandTocButton onClick={toggleToc} />
      )}
    </div>
  );
}
