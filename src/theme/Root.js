import React from 'react';
import ScratchNotes from '@site/src/components/ScratchNotes';

export default function Root({children}) {
  return (
    <>
      {children}
      <ScratchNotes />
    </>
  );
}
