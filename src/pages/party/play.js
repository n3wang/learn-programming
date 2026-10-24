import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';

export default function PartyPlayPage() {
  const zh = useDocusaurusContext().i18n.currentLocale.startsWith('zh');
  return (
    // The controller is a full-screen app on phones: this class hides the site
    // navbar and notes button here only (see BetsAndWagers/styles.module.css).
    <HtmlClassNameProvider className="bw-play-page">
      <Layout
        title={zh ? '竞猜下注 — 加入' : 'Bets & Wagers — Play'}
        description={zh ? '输入大屏幕上的房间码，加入竞猜下注游戏。' : 'Join a Bets & Wagers party with the room code on the big screen.'}
        noFooter>
        <BrowserOnly fallback={<p className="container margin-vert--lg">Loading…</p>}>
          {() => {
            const PlayerController = require('@site/src/components/BetsAndWagers/PlayerController').default;
            return <PlayerController />;
          }}
        </BrowserOnly>
      </Layout>
    </HtmlClassNameProvider>
  );
}
