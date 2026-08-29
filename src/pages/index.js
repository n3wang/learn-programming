import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css';

const ChessScene = React.lazy(() => import('@site/src/components/ChessScene'));

export default function Home() {
  return (
    <Layout title="Home" description="Resources for programming class">
      <div className={styles.hero}>
        <BrowserOnly fallback={null}>
          {() => (
            <React.Suspense fallback={null}>
              <ChessScene />
            </React.Suspense>
          )}
        </BrowserOnly>
      </div>
    </Layout>
  );
}
