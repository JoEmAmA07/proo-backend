# Proo Campus Backend (Node.js + MongoDB)

High-performance, lightweight REST API backend built for the Campus Lost & Found System.

## 🚀 Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Security & Config**: CORS, Dotenv

---

## 📁 Project Architecture
```
proo-backend/
├── src/
│   ├── config/
│   │   └── db.js            # MongoDB connection with retry & pooling
│   ├── controllers/
│   │   └── itemController.js# Items CRUD, text search, statistics, auto-seeding
│   ├── data/
│   │   └── seedData.js      # Initial campus items for first-time setup
│   ├── models/
│   │   └── Item.js          # Mongoose Schema with compound & text indexes
│   ├── routes/
│   │   └── itemRoutes.js    # Express REST route definitions
│   └── server.js            # Application entrypoint & middleware pipeline
├── .env                     # Environment variables (Port, Mongo URI, Client URL)
└── package.json             # Scripts & dependencies
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/proo_campus_db
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start the Server
- **Production Mode**:
  ```bash
  npm start
  ```
- **Development Mode (Auto-restart on save)**:
  ```bash
  npm run dev
  ```

---

## 📡 API Reference

### Health Check
- `GET /health` - Returns server status, uptime, and MongoDB connectivity.

### Items Endpoints (`/api/items`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items` | Fetch all items with optional query filters (`?type=lost\|found\|resolved`, `?category=...`, `?search=...`) |
| `GET` | `/api/items/:id` | Retrieve single item by its custom ID (e.g. `lf-001`) |
| `POST` | `/api/items` | Report a new lost or found item |
| `PATCH` | `/api/items/:id/status` | Update item status (`open`, `claimed`, `resolved`) |
| `DELETE`| `/api/items/:id` | Delete an item by ID |
| `GET` | `/api/items/stats` | Aggregated statistics (total, lost, found, resolved, category counts) |

---

## 🔗 Frontend Integration
The frontend in `../proo` connects via `src/services/api.ts` pointing to `http://localhost:5000/api`.
