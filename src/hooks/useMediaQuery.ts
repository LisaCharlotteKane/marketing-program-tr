import { useEffect, useState } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches)
    }
    
    // Set initial value
    updateMatches()
    
    // Add listener for changes
    mediaQuery.addEventListener("change", updateMatches)
    
    // Clean up
    return () => mediaQuery.removeEventListener("change", updateMatches)
  }, [query])

  return matches
}