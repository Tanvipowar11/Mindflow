# Mindflow

An AI-powered chat/dashboard application with a React + TypeScript frontend and a Node.js + GraphQL backend, featuring real-time messaging and AI responses.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Apollo Client (GraphQL)
- Zustand (state management)
- Tailwind CSS
- React Router
- Vitest + Cypress (testing)

**Backend**
- Node.js + Express + TypeScript
- Apollo Server (GraphQL) + WebSockets (subscriptions)
- MongoDB (Mongoose)
- JWT authentication (bcrypt + jsonwebtoken)
- Anthropic SDK & Groq SDK (AI integration)
- Jest (testing)

## Project Structure

```
mindflow-final/
├── frontend/          # React + Vite client
│   └── src/
│       ├── components/  # ChatInterface, Layout, common UI
│       ├── pages/       # Dashboard, Login, NotFound
│       ├── graphql/      # queries/mutations
│       ├── hooks/
│       └── utils/
└── backend/           # Express + GraphQL API
    └── src/
        ├── graphql/      # typeDefs & resolvers
        ├── middleware/   # auth
        ├── models/       # User, Conversation, Message
        └── server.ts
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- API keys for Anthropic and/or Groq

### 1. Clone the repo
```bash
git clone https://github.com/Tanvipowar11/Mindflow.git
cd Mindflow/mindflow-final
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```
PORT=
NODE_ENV=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRY=
CORS_ORIGIN=
GROQ_API_KEY=
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` with:
```
VITE_API_URL=
VITE_WS_URL=
```

Run the frontend:
```bash
npm run dev
```

## Available Scripts

**Backend** (`backend/`)
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled build |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage report |

**Frontend** (`frontend/`)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest tests |
| `npm run cypress` | Open Cypress test runner |

## Features
- User authentication (JWT-based)
- Real-time chat via GraphQL subscriptions / WebSockets
- AI-powered responses (Anthropic & Groq integration)
- Markdown rendering with syntax-highlighted code blocks in chat

 
