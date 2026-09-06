import React from 'react';
import ScratchNotes from '@site/src/components/ScratchNotes';
import '@site/src/client/googleTranslateDomPatch';
import '@site/src/client/googleTranslateNoTranslateCode';

export default function Root({children}) {
  return (
    <>
      {children}
      <ScratchNotes />
    </>
  );
}
