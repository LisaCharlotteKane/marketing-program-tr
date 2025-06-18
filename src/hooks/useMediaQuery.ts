import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create the media query checker
    const media = window.matchMedia(query);
    
    // Initial check
    setMatches(media.matches);
    
    // Event listener function
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