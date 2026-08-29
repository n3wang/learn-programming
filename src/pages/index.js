import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ChessScene from '@site/src/components/ChessScene';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout title="Home" description="Resources for programming class">
      <div className={styles.hero}>
        <BrowserOnly>{() => <ChessScene />}</BrowserOnly>
      </div>
    </Layout>
  );
}
