#  Note-Taking Full-Stack Web Application

A full-featured note-taking web application built using **Next.js (TypeScript)** for the frontend and **Express.js + MongoDB** for the backend. The application supports user-specific note management with pagination and a clean responsive UI.

---

##  Features

-  Create, read, update, and delete notes
-  User-specific note visibility
-  RESTful API integration
-  Server-Side Rendering (SSR) and Static Generation (SSG)
-  Clean and intuitive UI built with reusable components
-  Axios-based communication with backend
-  TypeScript for type safety and maintainability

---

##  Tech Stack

### Frontend
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- CORS, dotenv, body-parser middleware

---

## Installation

### Backend Setup (`/backend)

```bash
cd backend
npm install
```

#### Create `.env` file

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

#### Run the backend

```bash
npm run dev
```

---

### Frontend Setup ( `/frontend`)

```bash
cd frontend
npm install
```

#### Run the frontend

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
Note-Taking-Full-Stack-Web-Application
├── client/               # Frontend (Next.js + TypeScript)
│   ├── components/       # Reusable components
│   ├── pages/            # Next.js routes
│   ├── styles/           # CSS Modules or Tailwind
│   └── utils/            # API and helper functions
└── server/               # Backend (Express.js + MongoDB)
    ├── controllers/      # Route handlers
    ├── models/           # Mongoose schemas
    ├── routes/           # API routes
    └── index.js          # Main server file
```

---

## API Endpoints

| Method | Endpoint        | Description              |
|--------|------------------|--------------------------|
| GET    | /api/notes       | Get all/paginated notes  |
| POST   | /api/notes       | Create a new note        |
| PUT    | /api/notes/:id   | Update a note by ID      |
| DELETE | /api/notes/:id   | Delete a note by ID      |

---

## Future Improvements

- User authentication (JWT or OAuth)
- Dark mode

---
