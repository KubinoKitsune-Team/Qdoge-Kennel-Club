# Zealy Pagination Fix

## Problem
Only 300 out of 322 Zealy users were being fetched and stored in the database.

## Root Cause
The pagination logic was relying on the `totalPages` field from the Zealy API, which appears to be unreliable. The API was returning `totalPages: 3` or `totalPages: 4` inconsistently, causing the sync to stop after page 3 (300 users).

## Solution
Changed the pagination logic to use `totalRecords` instead of `totalPages`. The code now continues fetching pages until it has fetched all records reported by the API.

### Code Changes
**File**: `backend/app/services/zealy.py`

**Before**:
```python
# Check if there are more pages
total_pages = data.get("totalPages", 1)
if page >= total_pages:
    print(f"Reached last page ({page}/{total_pages})")
    break

page += 1
```

**After**:
```python
# Check if there are more pages based on totalRecords
total_records = data.get("totalRecords", 0)
print(f"API response: totalRecords={total_records}, fetched so far={total_fetched}")

# Continue if we haven't fetched all records yet
if total_fetched >= total_records:
    print(f"Fetched all {total_records} records")
    break

page += 1
```

## How It Works Now
1. Fetch page 1 (100 users) → total: 100/322
2. Fetch page 2 (100 users) → total: 200/322
3. Fetch page 3 (100 users) → total: 300/322
4. Fetch page 4 (22 users) → total: 322/322
5. Check: `if 322 >= 322` → TRUE, stop

## Next Steps

### 1. Rebuild and Restart Backend
```bash
docker compose build backend
docker compose up -d backend
```

### 2. Run Database Migration (Optional)
The migration script `backend/fix_zealy_address_column.py` needs to be run to:
- Remove the foreign key constraint (if it exists)
- Change the `address` column from VARCHAR(60) to VARCHAR(255)
- Clean invalid addresses

To run it:
```bash
docker exec qdoge-backend python fix_zealy_address_column.py
```

### 3. Verify the Fix
After restarting, check the logs to confirm all 322 users are being fetched:
```bash
docker logs qdoge-backend --tail 50 | grep -i zealy
```

You should see:
```
Fetching Zealy users page 1...
Page 1: fetched 100 user(s)
API response: totalRecords=322, fetched so far=100
Fetching Zealy users page 2...
Page 2: fetched 100 user(s)
API response: totalRecords=322, fetched so far=200
Fetching Zealy users page 3...
Page 3: fetched 100 user(s)
API response: totalRecords=322, fetched so far=300
Fetching Zealy users page 4...
Page 4: fetched 22 user(s)
API response: totalRecords=322, fetched so far=322
Fetched all 322 records
Fetched 322 user(s). Upserting...
Done: 322 user(s) upserted.
[Background] Zealy sync completed: {'fetched': 322, 'upserted': 322}
```

### 4. Verify Database
Check that all 322 users are in the database:
```bash
docker exec qdoge-backend python -c "
import asyncio
from app.core.db import async_session_factory, ZealyUser
from sqlalchemy import select, func

async def count_users():
    async with async_session_factory() as session:
        result = await session.execute(select(func.count()).select_from(ZealyUser))
        count = result.scalar()
        print(f'Total Zealy users in database: {count}')

asyncio.run(count_users())
"
```

## Files Modified
- `backend/app/services/zealy.py` - Fixed pagination logic

## Files to Review
- `backend/fix_zealy_address_column.py` - Migration script (optional, run if needed)
- `backend/app/core/db.py` - ZealyUser model (already correct)
