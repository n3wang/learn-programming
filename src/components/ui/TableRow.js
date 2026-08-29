import React from 'react';

export default function TableRow({children, ...rest}) {
  return <tr {...rest}>{children}</tr>;
}
