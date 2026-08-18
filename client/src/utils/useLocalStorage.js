import { useState, useEffect, useRef } from 'react';

/**
 * useLocalStorage
 * A drop-in replacement for useState that persists its value to
 * localStorage under `key`, and re-hydrates from localStorage on load.
 *
 * @param {string} key - the localStorage key to store data under
 * @param {*} initialValue - value (or lazy initializer) used the first time
 */
export default function useLocalStorage(key, initialValue) {
  const isFirstRender = useRef(true);

  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch (error) {
      console.error(`useLocalStorage: could not read key "${key}"`, error);
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    // Avoid an unnecessary write on the very first mount.
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`useLocalStorage: could not write key "${key}"`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
