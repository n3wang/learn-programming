import React from 'react';

export default function TableCell({children, ...rest}) {
  return <td {...rest}>{children}</td>;
}
