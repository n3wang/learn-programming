import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function PartyMenuPage() {
  const zh = useDocusaurusContext().i18n.currentLocale.startsWith('zh');
  return (
    <Layout title={zh ? '派对游戏' : 'Party games'} description={zh ? '在大屏幕上选一个派对游戏，大家用手机加入。' : 'Pick a party game for the big screen; everyone joins on their phone.'}>
      <BrowserOnly fallback={<p className="container margin-vert--lg">Loading…</p>}>
        {() => {
          const GameMenu = require('@site/src/components/party/menu/GameMenu').default;
          return <GameMenu />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
