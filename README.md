# agrisense-backend (Express + Mongoose)

Backend API สำหรับให้ Cloudflare (Pages/Workers) proxy มาเรียกแทนการต่อ MongoDB โดยตรง

## Endpoints
- GET `/healthz`
- GET `/api/scans/:id`
- PATCH `/api/scans/:id`
- DELETE `/api/scans/:id`
- POST `/api/scans/:id/complete`

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
