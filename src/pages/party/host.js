import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function PartyHostPage() {
  const zh = useDocusaurusContext().i18n.currentLocale.startsWith('zh');
  return (
    <Layout
      title={zh ? '数学与竞猜 — 主持' : 'Math and Wagers — Host'}
      description={zh ? '在大屏幕上主持数学与竞猜，玩家用手机加入。' : 'Host Math and Wagers on a shared screen; players join on their phones.'}>
      <BrowserOnly fallback={<p className="container margin-vert--lg">Loading…</p>}>
        {() => {
          // ?game=<id> picks a game from the /party menu; no game is Bets & Wagers.
          const {findGame} = require('@site/src/components/party/registry');
          const mod = findGame(new URLSearchParams(window.location.search).get('game'));
          if (mod) {
            if (mod.externalUrl) {
              const ExternalPartyDesk = require('@site/src/components/party/desk/ExternalPartyDesk').default;
              return <ExternalPartyDesk mod={mod} />;
            }
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
