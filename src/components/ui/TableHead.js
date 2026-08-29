import React from 'react';

export default function TableHead({children, ...rest}) {
  return <thead {...rest}>{children}</thead>;
}
