import {useCallback, useEffect, useState} from 'react';
import {
  SITE_AUTH_CHANGE_EVENT,
  isAdminAuth,
  loginWithAccount,
  logoutSiteAuth,
  readSiteAuth,
} from '@site/src/data/siteAuthSession';
import {deactivateHomeworkDraftMode} from '@site/src/data/homeworkDraftSession';

export function useSiteAuth() {
  const [auth, setAuth] = useState(() => readSiteAuth());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const sync = (event) => {
      setAuth(event?.detail?.auth || readSiteAuth());
    };
    window.addEventListener(SITE_AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(SITE_AUTH_CHANGE_EVENT, sync);
  }, []);

  const login = useCallback((account, password) => {
    return loginWithAccount({account, password});
  }, []);

  const logout = useCallback(async () => {
    // Admin-only tools should not stay active after logout.
    try {
      await deactivateHomeworkDraftMode();
    } catch {
      // ignore
    }
    const next = logoutSiteAuth();
    setAuth(next);
    return next;
  }, []);

  return {
    auth,
    isLoggedIn: Boolean(auth?.role),
    isAdmin: isAdminAuth(auth),
    isStudent: auth?.role === 'student',
    login,
    logout,
  };
}
