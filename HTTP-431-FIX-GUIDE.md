# HTTP 431 Error Fix Guide

## What is the HTTP 431 Error?

The **HTTP 431 "Request Header Fields Too Large"** error occurs when your browser sends headers that exceed the server's limit. This commonly happens in Spark apps when:

- Large data is stored in localStorage and gets sent as cookies
- Multiple sessions accumulate excessive header data
- Browser cookies become too large due to repeated saves

## Quick Fix Solutions

### Option 1: Use the Built-in Storage Manager

1. Open your Spark app (if possible)
2. Click the **Settings** gear icon in the top-right corner
3. Use the **Storage Management** panel to:
   - **Quick Cleanup**: Remove large files while keeping campaign data
   - **Clear App Data**: Remove all app-related storage
   - **Full Reset**: Nuclear option - clear everything

### Option 2: Browser Console Emergency Cleanup

If the app won't load at all:

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Copy and paste this emergency cleanup script:

```javascript
// Emergency cleanup for HTTP 431 errors
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  const name = c.split("=")[0].trim();
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
});
location.reload();
```

4. Press Enter to run the script
5. The page will reload with cleared storage

### Option 3: Incognito/Private Window

1. Open your Spark app in an **incognito/private browsing window**
2. This starts with completely clean storage
3. The app should work normally in this mode

### Option 4: Manual Browser Storage Cleanup

#### For Chrome:
1. Go to **Settings** → **Privacy and Security** → **Site Settings**
2. Click **View permissions and data stored across sites**
3. Find your Spark app domain (e.g., `*.github.app`)
4. Click the trash icon to delete all site data

#### For Firefox:
1. Go to **Settings** → **Privacy & Security**
2. Under **Cookies and Site Data**, click **Manage Data**
3. Search for your Spark app domain
4. Remove all related entries

#### For Safari:
1. Go to **Safari** → **Preferences** → **Privacy**
2. Click **Manage Website Data**
3. Search for your Spark app domain
4. Remove the entries

## Prevention Tips

To avoid this error in the future:

1. **Use the Settings panel regularly** to monitor storage usage
2. **Avoid importing extremely large CSV files** (>100 campaigns at once)
3. **Clear old data periodically** using the built-in cleanup tools
4. **Use export features** to backup data before major imports

## Technical Details

The 431 error happens because:
- Browsers send cookies and localStorage data as HTTP headers
- Spark's auto-sync features can accumulate large amounts of data
- HTTP servers have limits on header size (typically 8KB-32KB)
- When headers exceed this limit, the server refuses the request

## Still Having Issues?

If none of these solutions work:

1. Try a different browser entirely
2. Check if you have any browser extensions that might interfere
3. Clear your browser's entire cache and data
4. Contact support with details about when the error started

## Recovery

After cleanup, you may need to:
- Re-enter your campaign data (use CSV import for bulk data)
- Reconfigure any custom settings
- The app will work normally with the reduced data load