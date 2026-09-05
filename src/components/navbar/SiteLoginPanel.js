import React, {useMemo, useState} from 'react';
import {filterLoginDirectory} from '@site/src/data/siteAuthSession';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';

const HOMEWORK_SUBMIT_URL =
  'https://drive.google.com/drive/folders/1cUjkXudoElFuF98pQVmk9fsggHnhcpdm?usp=sharing';

const inputStyle = {
  width: '100%',
  minWidth: 0,
  padding: '0.35rem 0.5rem',
  borderRadius: 8,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
};

export default function SiteLoginPanel() {
  const {auth, isLoggedIn, isAdmin, isStudent, login, logout} = useSiteAuth();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(
    () => filterLoginDirectory(query || selected?.name || '', 10),
    [query, selected],
  );

  if (isLoggedIn) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{fontSize: '0.9rem', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {isAdmin ? 'Admin' : auth?.name || 'Student'}
          {!isAdmin && auth?.rosterLabel ? (
            <span
              style={{
                marginLeft: 6,
                fontWeight: 500,
                color: 'var(--ifm-color-emphasis-600)',
                fontSize: '0.8rem',
              }}
            >
              · {auth.rosterLabel}
            </span>
          ) : null}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0}}>
          {isStudent ? (
            <a
              className="button button--sm button--primary"
              href={HOMEWORK_SUBMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{padding: '0.25rem 0.55rem', whiteSpace: 'nowrap'}}
            >
              提交作业
            </a>
          ) : null}
          <button
            type="button"
            className="button button--sm button--secondary"
            style={{padding: '0.25rem 0.55rem'}}
            onClick={() => logout()}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = (event) => {
    event.preventDefault();
    setError('');
    const account =
      selected ||
      suggestions.find((row) => row.name === query.trim()) ||
      null;
    const result = login(account, password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
      return;
    }
    setPassword('');
    setQuery('');
    setSelected(null);
  };

  return (
    <form onSubmit={onSubmit} style={{display: 'grid', gap: '0.4rem'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'nowrap',
        }}
      >
        <div style={{position: 'relative', flex: '1.2 1 0', minWidth: 0}}>
          <input
            style={inputStyle}
            value={selected ? selected.name : query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
              setShowSuggestions(true);
              setError('');
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Allow suggestion click before hide
              window.setTimeout(() => setShowSuggestions(false), 150);
            }}
            placeholder="Name"
            autoComplete="username"
            aria-label="Login name"
          />
          {showSuggestions && suggestions.length > 0 ? (
            <ul
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 'calc(100% + 0.2rem)',
                zIndex: 5,
                listStyle: 'none',
                margin: 0,
                padding: 0,
                maxHeight: 160,
                overflowY: 'auto',
                border: '1px solid var(--ifm-color-emphasis-200)',
                borderRadius: 8,
                background: 'var(--ifm-background-surface-color)',
                boxShadow: 'var(--ifm-global-shadow-lw)',
              }}
            >
              {suggestions.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelected(row);
                      setQuery(row.name);
                      setShowSuggestions(false);
                      setError('');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      padding: '0.4rem 0.55rem',
                      cursor: 'pointer',
                      color: 'var(--ifm-font-color-base)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>{row.name}</strong>
                    <span
                      style={{
                        marginLeft: 6,
                        color: 'var(--ifm-color-emphasis-600)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {row.rosterLabel}
                      {row.pinyin ? ` · ${row.pinyin}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <input
          style={{...inputStyle, flex: '1 1 0'}}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Password"
          autoComplete="current-password"
          aria-label="Password"
        />

        <button
          type="submit"
          className="button button--sm button--primary"
          style={{flexShrink: 0, whiteSpace: 'nowrap'}}
        >
          Log in
        </button>
      </div>

    </form>
  );
}
