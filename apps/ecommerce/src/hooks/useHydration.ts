import { useState, useEffect } from 'react';

/**
 * Custom hook to handle hydration mismatch issues
 * Returns true when the component has been hydrated on the client
 */
export const useHydration = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
