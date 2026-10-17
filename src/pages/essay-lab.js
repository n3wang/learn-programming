import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function EssayLabPage() {
  return (
    <Layout title="Essay Lab" description="Write short essays with the vocabulary and sources you've learned, and earn points for using them.">
      <main className="container margin-vert--lg">
        <h1>Essay Lab</h1>
        <p>
          Pick a deck, answer its prompt, and use the deck's keywords in full sentences. Cite sources with{' '}
          <code>[@citation-id]</code>. Each citation unlocks once you pass one of its quizzes. Everything is saved in this
          browser.
        </p>
        <BrowserOnly fallback={<p>Loading…</p>}>
          {() => {
            const EssayLab = require('@site/src/components/EssayLab').default;
            return <EssayLab />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
