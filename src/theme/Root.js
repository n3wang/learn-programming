import React from 'react';
import ScratchNotes from '@site/src/components/ScratchNotes';
import '@site/src/client/googleTranslateDomPatch';

export default function Root({children}) {
  return (
    <>
      {children}
      <ScratchNotes />
    </>
  );
}
