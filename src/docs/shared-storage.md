# Marketing Planner - Shared Storage Implementation

This marketing planner application uses GitHub Spark's storage capabilities to persist data across sessions and share it with all users.

## How Shared Storage Works

The application leverages GitHub Spark's `useKV` hook with the `scope: 'global'` option to create storage that is shared among all users:

```tsx
// In App.tsx
const [campaigns, setCampaigns] = useKV('campaignData', [], { scope: 'global' });
```

By setting `scope: 'global'`, any data stored is visible to all users of the application, not just the current user.

## Storage Types

1. **Global Storage** (`scope: 'global'`)
   - Shared with all users
   - Used for campaign data, budgets, etc.

2. **User Storage** (default for `useKV`)
   - Specific to each user
   - Used for personal preferences

## Storage Management

The application includes a Storage tab where you can:
- View current storage contents
- See the number of stored campaigns
- Compare global vs. user storage

## Troubleshooting

If you don't see data that others have added:
1. Check the Storage tab to verify the data is in global scope
2. Refresh the page to ensure you have the latest data
3. Make sure your code is using `{ scope: 'global' }` for shared data

## Data Migration

The app includes automatic migration of user-scoped data to global scope through the `useMigrateToGlobal` hook, which checks if user data exists but global data doesn't, and copies it over.