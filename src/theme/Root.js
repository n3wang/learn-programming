import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ScratchNotes from '@site/src/components/ScratchNotes';
import {rememberApiBaseUrl, resolveApiBaseUrl} from '@site/src/api/classroomClient';
import '@site/src/client/googleTranslateDomPatch';
import '@site/src/client/googleTranslateNoTranslateCode';

function ApiBaseUrlBridge() {
  const {siteConfig} = useDocusaurusContext();
  const apiBaseUrl = resolveApiBaseUrl(siteConfig?.customFields);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      rememberApiBaseUrl(apiBaseUrl);
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
