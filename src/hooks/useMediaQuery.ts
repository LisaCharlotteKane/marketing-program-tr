import { useState, useEffect } from 'react';

/**
 * Hook that tracks state of a CSS media query
 *
 * @param {string} query - CSS media query to track
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Define listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}