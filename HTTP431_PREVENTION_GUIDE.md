# HTTP 431 "Request Header Fields Too Large" Fix

This document outlines the comprehensive solution implemented to prevent HTTP 431 errors in the marketing campaign planner app.

## Problem
HTTP 431 errors occur when the total size of request headers (including cookies) exceeds server limits, typically around 8-16KB.

## Solution Overview

### 1. Header Size Monitoring (`src/utils/header-guard.ts`)
- **Real-time monitoring** of header sizes every 30 seconds
- **Automatic cleanup** when headers approach dangerous sizes
- **Minimal headers** for fetch requests (only essential headers)
- **Safe thresholds**: Warning at 6KB, critical at 8KB

### 2. Enhanced Cookie Cleanup (`src/lib/cookie-cleanup.ts`)
- **Comprehensive patterns** for problematic cookie identification
- **Multiple deletion attempts** with different domain/path combinations
- **Size-based cleanup** (removes cookies >4KB)
- **Automatic triggering** when header limits are approached

### 3. Storage Size Management (`src/utils/storage-size-guard.ts`)
- **localStorage monitoring** with 5MB limit awareness
- **Automatic compression** of campaign data
- **Safe storage methods** that prevent overflow
- **Large item cleanup** (removes items >512KB)

### 4. GitHub API Optimization (`src/services/github-api.ts`)
- **Minimal headers** using `Bearer` tokens instead of `token`
- **HTTP 431 detection** and automatic retry with cleanup
- **Header size validation** before making requests
- **Reduced header verbosity** (shorter committer info, etc.)

### 5. Centralized Prevention System (`src/utils/http431-prevention.ts`)
- **Initialization on app startup** clears problematic data
- **Emergency cleanup functions** for critical situations
- **Periodic monitoring** every 2 minutes for critical conditions
- **System status reporting** for debugging

### 6. Real-time Monitoring Component (`src/components/http431-monitor.tsx`)
- **Visual status indicator** showing header/storage health
- **Manual cleanup triggers** for users
- **Warning alerts** when approaching limits
- **Real-time statistics** updated every 30 seconds

## Implementation Details

### Files Modified
- `src/App.tsx` - Added monitoring initialization
- `src/main.tsx` - Early prevention system startup
- `src/hooks/useKV.ts` - Safe localStorage operations
- `src/services/github-api.ts` - Optimized API calls
- `src/lib/cookie-cleanup.ts` - Enhanced cookie management

### Files Created
- `src/utils/header-guard.ts` - Header size monitoring
- `src/utils/storage-size-guard.ts` - Storage management
- `src/utils/http431-prevention.ts` - Centralized system
- `src/components/http431-monitor.tsx` - UI monitoring
- `nginx.conf.example` - Server configuration reference

### Key Features
1. **Automatic cleanup** when headers exceed 6KB
2. **Emergency cleanup** for critical conditions (>8KB)
3. **Safe storage** with overflow prevention
4. **Compressed data** storage for campaign information
5. **Real-time monitoring** with user feedback
6. **Server configuration** examples for self-hosting

## Usage

The system initializes automatically when the app starts. Users can:

1. **Monitor status** via the bottom-right indicator
2. **Manual cleanup** using the "Clean Up" button
3. **View warnings** when approaching limits
4. **Emergency reset** if errors persist

## Server Configuration (Optional)

For self-hosted deployments, use the provided `nginx.conf.example`:

```nginx
large_client_header_buffers 8 16k;  # Allows up to 128KB total headers
client_header_buffer_size 4k;       # Initial buffer
```

## Monitoring

The system provides real-time feedback on:
- Current header size estimation
- Cookie size breakdown
- localStorage usage percentage
- Active warnings and recommendations

## Emergency Procedures

If HTTP 431 errors persist:

1. **Automatic**: System detects and cleans up automatically
2. **Manual**: Use the monitoring widget's "Clean Up" button
3. **Nuclear**: Clear all browser data for the site
4. **Server**: Adjust header buffer sizes if self-hosting

## Performance Impact

- **Minimal overhead**: Monitoring runs every 30 seconds
- **Efficient cleanup**: Only removes problematic data
- **Safe operations**: No data loss from campaign storage
- **User transparent**: Cleanup happens in background

This comprehensive solution should prevent HTTP 431 errors while maintaining full app functionality and user data integrity.