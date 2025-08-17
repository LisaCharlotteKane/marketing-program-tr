import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WarningCircle } from "@phosphor-icons/react";

interface DataErrorProps {
  /**
   * The error message to display
   */
  message: string;
  
  /**
   * Optional title for the error alert
   */
  title?: string;
  
  /**
   * CSS class to apply to the alert
   */
  className?: string;
}

/**
 * Component for displaying data-related errors in a consistent way
 */
export function DataError({ 
  message, 
  title = "Data Error", 
  className = ""
}: DataErrorProps) {
  return (
    <Alert variant="destructive" className={`bg-red-50 border-red-200 ${className}`}>
      <WarningCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">{title}</AlertTitle>
      <AlertDescription className="text-red-700">{message}</AlertDescription>
    </Alert>
  );
}