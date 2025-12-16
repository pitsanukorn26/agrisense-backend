# agrisense-backend (Express + Mongoose)

Backend API สำหรับให้ Cloudflare (Pages/Workers) proxy มาเรียกแทนการต่อ MongoDB โดยตรง

## Endpoints
- GET `/healthz` (legacy) / `/api/health`
- GET `/api/scans/:id`
- PATCH `/api/scans/:id`
- DELETE `/api/scans/:id`
- POST `/api/scans/:id/complete`
- POST `/api/profile/avatar` (multipart form-data)
- GET `/api/diseases`
- GET `/api/diseases/:id`

## Requirements
- Node.js 20+
- MongoDB Atlas connection string

## Setup (Local)
```bash
cp .env.example .env
npm install
npm run dev
```

## Build/Run (Production)
```bash
npm install
npm run build
npm run start
```

## Environment Variables
- `MONGODB_URI` (required)
- `PORT` (optional)
- `ALLOWED_ORIGIN` (optional) comma-separated origins for CORS
- `AUTH_TOKEN` (optional, bearer token for simple auth)
- `AUTH_BYPASS` (default `true`, set `false` to enforce `AUTH_TOKEN`)
- Storage (avatar upload)
  - Azure Blob (SAS): `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_CONTAINER`, `AZURE_STORAGE_SAS` (e.g. ?sv=...), `PUBLIC_ASSET_BASE` (e.g. https://<account>.blob.core.windows.net/avatars)
  - S3-compatible (fallback): `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `PUBLIC_ASSET_BASE`
- Debug: `DEBUG_LOG_TOKEN` (optional, protect `/api/debug/logs`), `REQUEST_LOG_LIMIT` (default 200)

## Deploy (Railway/Render)
1) สร้าง service ใหม่จาก repo นี้  
2) Set env:
   - `MONGODB_URI=<your atlas uri>`
3) Build command:
   - `npm install && npm run build`
4) Start command:
   - `node dist/server.js` (หรือ `npm run start`)
5) ทดสอบ:
   - `GET https://<backend-domain>/healthz`
   - `GET https://<backend-domain>/api/scans/<id>`

## Connect from Cloudflare
ตั้ง env บน Cloudflare:
- `BACKEND_API_URL=https://<backend-domain>`  (ไม่มี / ท้าย)

> Note: `src/models/Scan.ts` เป็น schema ตัวอย่างให้รันได้ทันที  
> ถ้าคุณมีโมเดล Scan ในโปรเจกต์หลักอยู่แล้ว แนะนำคัดลอกมาแทนไฟล์นี้เพื่อให้ field ตรง 100%.
