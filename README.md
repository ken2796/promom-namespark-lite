# promom-namespark-lite

A baby name discovery app built with NestJS (backend).

---

## Local Run Instructions

### Prerequisites
- Node.js LTS (v20+)
- npm

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Server runs at `http://localhost:3000`
Verify it works: `http://localhost:3000/v1/health`



## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/health` | Health check |
| POST | `/v1/name-spark/search` | Search and filter names |
| GET | `/v1/names/:id` | Get name detail |
| PATCH | `/v1/names/:id/favorite` | Toggle favorite |

### Search Request Example

```json
{
  "gender": "Girl",
  "origins": ["Arabic"],
  "startingLetter": "A"
}
```
