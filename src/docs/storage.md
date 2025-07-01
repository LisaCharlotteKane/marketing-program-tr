# Shared Storage in Marketing Planner

This document explains how data storage works in the Marketing Planner application.

## Storage Scopes

The application uses two types of storage scopes:

1. **Global Storage** (`scope: 'global'`)
   - Data is shared among all users of the application
   - Use this for campaign data, budgets, and other shared information
   - Any changes made by one user are visible to all other users

2. **User Storage** (`scope: 'user'`)
   - Data is specific to each individual user
   - Use this for user preferences, filters, and other personal settings
   - Changes made by one user are not visible to others

## Usage in Code

### With React Hooks

```tsx
// Import the useKV hook
import { useKV } from '@github/spark/hooks';

// For global (shared) data:
const [campaigns, setCampaigns] = useKV('campaignData', [], { scope: 'global' });

// For user-specific data:
const [userPrefs, setUserPrefs] = useKV('userPreferences', {});
```

### With Custom Hooks

The application provides custom hooks for easier usage:

```tsx
// Import custom hooks
import { useGlobalStorage, useUserStorage } from '@/hooks/useSharedStorage';

// For global (shared) data:
const [campaigns, setCampaigns] = useGlobalStorage('campaignData', []);

// For user-specific data:
const [userPrefs, setUserPrefs] = useUserStorage('userPreferences', {});
```

## Best Practices

1. Use global scope for shared business data (campaigns, budgets, etc.)
2. Use user scope for individual preferences and settings
3. When migrating from user to global scope, use the `useMigrateToGlobal` hook
4. Check the Storage tab to verify data is being saved correctly

## Troubleshooting

If data is not appearing for all users:
1. Ensure you're using `{ scope: 'global' }` with the useKV hook
2. Check the Storage tab to verify data is saved in the global scope
3. Try refreshing the page if changes are not immediately visible