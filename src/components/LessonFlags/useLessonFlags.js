import {useEffect, useState} from 'react';
import {
  LESSON_FLAGS_CHANGE_EVENT,
  LESSON_FLAGS_KEY,
  readFlagState,
} from '@site/src/data/lessonFlags/store';

/** Live local flag state (`{revealed, captured}`); empty during SSR. */
export default function useLessonFlags() {
  const [state, setState] = useState({revealed: {}, captured: {}});

  useEffect(() => {
    const sync = () => setState(readFlagState());
    const onStorage = (event) => {
      if (event.key === LESSON_FLAGS_KEY) {
        sync();
      }
    };
    sync();
    window.addEventListener(LESSON_FLAGS_CHANGE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(LESSON_FLAGS_CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return state;
}
