import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function ClassActivityPage() {
  return (
    <Layout title="Class activity" description="Which students worked on which days.">
      <main className="container margin-vert--lg">
        <h1>Class activity</h1>
        <p>
          Student × day heatmap from <code>/api/store/student_activity</code>. Click a cell to see that day's events.
        </p>
        <BrowserOnly fallback={<p>Loading…</p>}>
          {() => {
            const ClassActivityHeatmap = require('@site/src/components/activity/ClassActivityHeatmap').default;
            return <ClassActivityHeatmap />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
