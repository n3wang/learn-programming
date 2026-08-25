import {useEffect, useState} from 'react';

export default function useHtmlColorMode() {
  const [colorMode, setColorMode] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setColorMode(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {attributes: true, attributeFilter: ['data-theme']});
    return () => observer.disconnect();
  }, []);

  return colorMode;
}
