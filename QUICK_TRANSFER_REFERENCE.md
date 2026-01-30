# Quick Transfer Feature Reference

## 🚀 Quick Start

### View Transfers in UI
1. Navigate to `/activity` page
2. Select an epoch from the left panel
3. Click "Transfer" button
4. View transfers data with statistics

### API Endpoints

```bash
# Get all transfers for an epoch
GET /api/epochs/{epoch_num}/transfers

# Get all transfers (paginated)
GET /api/transfers?page=0&size=100

# Get transfers for a wallet
GET /api/transfers/wallet/{wallet_id}?page=0&size=100
```

## 📁 Key Files

### Backend
- `backend/app/services/transfer.py` - Sync service
- `backend/app/main.py` - API endpoints (lines ~518-600)
- `backend/app/core/db.py` - Transfer model (lines ~310-360)

### Frontend
- `src/pages/activity/components/EpochTransfers.tsx` - Main component
- `src/pages/activity/components/DisplaySection.tsx` - Integration
- `src/services/backend.service.ts` - API client

## 🔧 Configuration

### Backend (.env)
```bash
TRADE_ISSUER=QDOGEEESKYPAICECHEAHOXPULEOADTKGEJHAVYPFKHLEWGXXZQUGIGMBUTZE
TRADE_ASSET=QDOGE
TRADE_UPDATE_INTERVAL=300  # seconds
```

## 📊 Data Structure

### Transfer Object
```typescript
{
  transfer_id: number;
  tx_hash: string;
  source: string;           // sender wallet
  destination: string;      // receiver wallet
  issuer: string;
  asset_name: string;       // "QDOGE"
  amount: string;           // token amount
  tick: number;
  tickdate: string;         // ISO timestamp
  money_flew: boolean;
}
```

## 🎨 UI Sections

1. **Main Table**: All transfers chronologically
2. **Senders**: Top senders by amount (orange)
3. **Receivers**: Top receivers by amount (blue)
4. **All Wallets**: Net transfer analysis

## 🔍 Features

- ✅ Epoch-based filtering
- ✅ Wallet search
- ✅ Automatic sync (5 min)
- ✅ Statistics calculation
- ✅ Clickable links
- ✅ Responsive design

## 🐛 Troubleshooting

### No transfers showing?
1. Check backend logs for sync errors
2. Verify database has transfer records: `SELECT COUNT(*) FROM transfer;`
3. Check epoch time range matches transfer tickdates

### Sync not working?
1. Check `TRADE_ISSUER` and `TRADE_ASSET` env vars
2. Verify API endpoint is accessible
3. Check backend logs for error messages

### UI not loading?
1. Check browser console for errors
2. Verify API endpoint returns data
3. Check network tab for failed requests

## 📝 Common Tasks

### Manually trigger sync
```python
from app.services.transfer import service_transfer
result = await service_transfer.update_transfers(issuer, asset)
print(result)  # {fetched: X, inserted: Y, skipped: Z}
```

### Query transfers in database
```sql
-- Count transfers
SELECT COUNT(*) FROM transfer;

-- Recent transfers
SELECT * FROM transfer ORDER BY tickdate DESC LIMIT 10;

-- Transfers by wallet
SELECT * FROM transfer 
WHERE source = 'WALLET_ID' OR destination = 'WALLET_ID'
ORDER BY tickdate DESC;

-- Transfers in epoch
SELECT t.* FROM transfer t
JOIN epoch e ON t.tickdate >= e.start_tick 
  AND (e.end_tick IS NULL OR t.tickdate < e.end_tick)
WHERE e.epoch_num = 197;
```

### Test API endpoint
```bash
# Get epoch transfers
curl http://localhost:8000/api/epochs/197/transfers

# Get wallet transfers
curl http://localhost:8000/api/transfers/wallet/WALLET_ID
```

## 🎯 Key Differences from Trades

| Feature | Trades | Transfers |
|---------|--------|-----------|
| Color | Green/Red | Orange/Blue |
| Direction | Buy/Sell | Sent/Received |
| Parties | Taker/Maker | Source/Destination |
| Calculation | Buy-Sell | Received-Sent |
| Table | 3 sections | 3 sections |

## ✅ Verification

Check everything is working:
```bash
# 1. Backend sync running
docker logs backend | grep "transfer update"

# 2. Database has data
psql -c "SELECT COUNT(*) FROM transfer;"

# 3. API responds
curl http://localhost:8000/api/epochs/197/transfers

# 4. UI loads
# Navigate to /activity → Select epoch → Click Transfer
```

## 📚 Documentation

- `TRANSFER_TABLE_INTEGRATION.md` - Backend details
- `TRANSFER_DISPLAY_INTEGRATION.md` - Frontend details
- `TRANSFER_FEATURE_SUMMARY.md` - Complete overview
- `QUICK_TRANSFER_REFERENCE.md` - This file
