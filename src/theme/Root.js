import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ScratchNotes from '@site/src/components/ScratchNotes';
import '@site/src/client/googleTranslateDomPatch';
import '@site/src/client/googleTranslateNoTranslateCode';

function ApiBaseUrlBridge() {
  const {siteConfig} = useDocusaurusContext();
  const apiBaseUrl =
    typeof siteConfig?.customFields?.apiBaseUrl === 'string'
      ? siteConfig.customFields.apiBaseUrl.replace(/\/$/, '')
      : 'http://localhost:8080';

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__LEARN_API_BASE_URL__ = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  return null;
}

export default function Root({children}) {
  return (
    <>
      <ApiBaseUrlBridge />
      {children}
      <ScratchNotes />
    </>
  );
}
