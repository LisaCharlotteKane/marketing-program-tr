import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface SaveStatus {
  isSaving: boolean;
  lastSaved?: Date;
  forceSave: () => void;
}

export function useEnhancedCampaigns<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, SaveStatus] {
  const [data, setData] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        setData(JSON.parse(savedData));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error(`Error loading ${key} data:`, error);
      // Dispatch a custom error event that can be handled by the StorageErrorHandler
      window.dispatchEvent(
        new CustomEvent("app:error", {
          detail: {
            type: "storage",
            message: `Error loading saved ${key} data. Using defaults.`
          }
        })
      );
      setIsLoaded(true);
    }
  }, [key]);
  
  // Save data when it changes, with debounce
  useEffect(() => {
    // Skip initial render
    if (!isLoaded) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const saveData = async () => {
        setIsSaving(true);
        try {
          localStorage.setItem(key, JSON.stringify(data));
          setLastSaved(new Date());
        } catch (error) {
          console.error(`Error saving ${key} data:`, error);
          toast.error(`Failed to save ${key} data`);
        } finally {
          setIsSaving(false);
        }
      };
      
      saveData();
    }, 500); // 500ms debounce
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, key, isLoaded]);
  
  // Force save function
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setLastSaved(new Date());
      toast.success("Data saved successfully");
    } catch (error) {
      console.error(`Error force saving ${key} data:`, error);
      toast.error(`Failed to save ${key} data`);
    } finally {
      setIsSaving(false);
    }
  }, [data, key]);
  
  return [data, setData, { isSaving, lastSaved, forceSave }];
}