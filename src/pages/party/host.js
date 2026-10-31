import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function PartyHostPage() {
  const zh = useDocusaurusContext().i18n.currentLocale.startsWith('zh');
  return (
    <Layout
      title={zh ? '课堂测验 — 主持' : 'School Quiz — Host'}
      description={zh ? '在大屏幕上主持课堂测验，玩家用手机加入。' : 'Host a School Quiz on a shared screen; players join on their phones.'}>
      <BrowserOnly fallback={<p className="container margin-vert--lg">Loading…</p>}>
        {() => {
          // ?game=<id> picks a game from the /party menu; no game is Bets & Wagers.
          const {findGame} = require('@site/src/components/party/registry');
          const mod = findGame(new URLSearchParams(window.location.search).get('game'));
          if (mod) {
            const HostShell = require('@site/src/components/party/core/HostShell').default;
            return <HostShell mod={mod} />;
          }
          const HostScreen = require('@site/src/components/BetsAndWagers/HostScreen').default;
          return <HostScreen />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
