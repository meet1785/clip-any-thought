Mock Backend (Temporary Supabase Replacement)
=============================================

This backend lets you test the app without Supabase.

Endpoints:
- `GET /health`
- `POST /analyze-video`
- `PUT /clips/:id`

Run backend:

```bash
npm run mock-backend
```

Run frontend:

```bash
npm run dev
```

Run both together:

```bash
npm run dev:mock
```

Environment flags (already set in `.env`):
- `VITE_USE_MOCK_BACKEND=true`
- `VITE_MOCK_BACKEND_URL=http://localhost:8787`

To re-enable Supabase later:
- Set `VITE_USE_MOCK_BACKEND=false`
- Restart the dev server

Notes:
- Vite serves on port `8080` in this project configuration.
- If you already have old Vite servers on `5173`/`5174`, close them so you do not open a stale tab.
