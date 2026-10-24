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
          const HostScreen = require('@site/src/components/BetsAndWagers/HostScreen').default;
          return <HostScreen />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
