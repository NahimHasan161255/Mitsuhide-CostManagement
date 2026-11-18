import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value (e.g., search query input).
 * @param value The input value to debounce
 * @param delay Milliseconds to wait before updating (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // If the input is cleared immediately (e.g. clicking allowClear 'X'), clear instantly without delay
    if (typeof value === 'string' && value.trim() === '') {
      setDebouncedValue(value);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
