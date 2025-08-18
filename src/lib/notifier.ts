import { toast } from "sonner";

// Notifier wrapper to provide toast methods using Sonner
export const notifier = {
  success: (message: string) => {
    toast(message, {
      description: "Success",
      style: { backgroundColor: '#10b981', color: 'white' }
    });
  },
  error: (message: string) => {
    toast(message, {
      description: "Error", 
      style: { backgroundColor: '#ef4444', color: 'white' }
    });
  },
  info: (message: string) => {
    toast(message, {
      description: "Info",
      style: { backgroundColor: '#3b82f6', color: 'white' }
    });
  },
  warning: (message: string) => {
    toast(message, {
      description: "Warning",
      style: { backgroundColor: '#f59e0b', color: 'white' }
    });
  },
  loading: (message: string) => {
    toast(message, {
      description: "Loading...",
      duration: 0 // Keep loading toast indefinitely
    });
  },
  dismiss: () => {
    toast.dismiss();
  }
};