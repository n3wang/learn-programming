import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import ScratchNotes from '@site/src/components/ScratchNotes';
import TermPeek from '@site/src/components/TermPeek';
import StudentPickDock from '@site/src/components/navbar/StudentPickDock';
import StudentActivityReporter from '@site/src/components/activity/useStudentActivityReporter';
import FlagRevealToast from '@site/src/components/LessonFlags/RevealToast';
import LessonFlagsSync from '@site/src/components/LessonFlags/LessonFlagsSync';
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

/**
 * Pages opened from a shared link (?course=… / ?student=…, e.g. the 成绩 report sent to
 * parents) get `html.link-view`: custom.css hides the doc sidebar, breadcrumbs, TOC and
 * prev/next links so only the page content shows. Normal navigation clears it.
 */
function LinkViewClass() {
  const {search} = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(search);
    const on = params.has('course') || params.has('student');
    document.documentElement.classList.toggle('link-view', on);
  }, [search]);
  return null;
}

export default function Root({children}) {
  return (
    <>
      <ApiBaseUrlBridge />
      <LinkViewClass />
      <StudentActivityReporter />
      <LessonFlagsSync />
      {children}
      <ScratchNotes />
      <TermPeek />
      <StudentPickDock />
      <FlagRevealToast />
    </>
  );
}
