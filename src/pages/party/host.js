import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function PartyHostPage() {
  const zh = useDocusaurusContext().i18n.currentLocale.startsWith('zh');
  return (
    <Layout
      title={zh ? '竞猜下注 — 主持' : 'Bets & Wagers — Host'}
      description={zh ? '在大屏幕上主持竞猜下注游戏，玩家用手机加入。' : 'Host a Bets & Wagers trivia party on a shared screen; players join on their phones.'}>
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
