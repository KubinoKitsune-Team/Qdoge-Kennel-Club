# Quick Deploy Guide - Zealy Pagination Fix

## What Was Fixed
The Zealy sync was only fetching 300 out of 322 users due to a pagination bug. The fix changes the pagination logic to use `totalRecords` instead of `totalPages`.

## Deploy Steps

### 1. Rebuild Backend (Required)
```bash
docker compose build backend
docker compose up -d backend
```

### 2. Wait for Sync (10 minutes)
The background task runs every 10 minutes. Wait for the next sync cycle.

### 3. Verify (Optional)
```bash
# Check logs
docker logs qdoge-backend --tail 50 | grep -i zealy

# Should see:
# Fetched all 322 records
# Done: 322 user(s) upserted.
```

### 4. Run Verification Script (Optional)
```bash
docker exec qdoge-backend python verify_zealy_sync.py

# Should see:
# ✅ SUCCESS: All 322 users have been synced!
```

## That's It!
After rebuilding and waiting for the next sync, all 322 Zealy users will be fetched and stored in the database. The ✅ icons will appear next to registered wallets on the Activity page.

## Files Changed
- `backend/app/services/zealy.py` - Fixed pagination logic

## Rollback (If Needed)
```bash
git checkout backend/app/services/zealy.py
docker compose build backend
docker compose up -d backend
```

## Support
Check logs for any errors:
```bash
docker logs qdoge-backend --tail 100
```
