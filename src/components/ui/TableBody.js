import React from 'react';

export default function TableBody({children, ...rest}) {
  return <tbody {...rest}>{children}</tbody>;
}
