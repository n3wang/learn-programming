import React, {createContext, useContext} from 'react';

const Ctx = createContext(null);

export default function TabContext({value, children}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTabContext() {
  return useContext(Ctx);
}
