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
        title={zh ? '课堂测验 — 加入' : 'School Quiz — Play'}
        description={zh ? '输入大屏幕上的房间码，加入课堂测验。' : 'Join a School Quiz with the room code on the big screen.'}
        noFooter>
        <BrowserOnly fallback={<p className="container margin-vert--lg">Loading…</p>}>
          {() => {
            // The host's join link carries ?game=<id>; no game is Bets & Wagers.
            const {findGame} = require('@site/src/components/party/registry');
            const mod = findGame(new URLSearchParams(window.location.search).get('game'));
            if (mod) {
              const PlayerShell = require('@site/src/components/party/core/PlayerShell').default;
              return <PlayerShell mod={mod} />;
            }
            const PlayerController = require('@site/src/components/BetsAndWagers/PlayerController').default;
            return <PlayerController />;
          }}
        </BrowserOnly>
      </Layout>
    </HtmlClassNameProvider>
  );
}
