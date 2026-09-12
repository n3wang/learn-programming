import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ScratchNotes from '@site/src/components/ScratchNotes';
import {
  isLocalApiBase,
  readStoredApiBaseUrl,
  rememberApiBaseUrl,
  resolveApiBaseUrl,
} from '@site/src/api/classroomClient';
import '@site/src/client/googleTranslateDomPatch';
import '@site/src/client/googleTranslateNoTranslateCode';

function ApiBaseUrlBridge() {
  const {siteConfig} = useDocusaurusContext();
  const apiBaseUrl = resolveApiBaseUrl(siteConfig?.customFields);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = readStoredApiBaseUrl();
    // Keep a remembered remote base when the build default is localhost so
    // media-library / classroom calls do not flap every navigation.
    if (stored && isLocalApiBase(apiBaseUrl) && !isLocalApiBase(stored)) {
      return;
    }
    rememberApiBaseUrl(apiBaseUrl);
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
