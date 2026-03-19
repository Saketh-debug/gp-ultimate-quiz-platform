---
description: Repository Information Overview
alwaysApply: true
---

# Ultimate Quiz Platform Information

## Repository Summary
The **Ultimate Quiz Platform** is a multi-component web application designed for hosting and managing competitive programming contests and quizzes. It features real-time updates via Socket.io, a specialized code submission and evaluation system with queue management, and a comprehensive admin interface for contest orchestration.

## Repository Structure
The repository is organized into three main independent projects:
- **`client/`**: The frontend application built with React and Vite, providing the user interface for contestants and admins.
- **`server/`**: The primary backend service handling authentication, contest logic, question management, and real-time state synchronization.
- **`load-balancer/`**: A specialized service (named `queue-handler-judge0`) that manages code submission queues using BullMQ and Redis, acting as an intermediary for code execution.

### Main Repository Components
- **Client**: A React-based single-page application (SPA) with integrated code editing via Monaco Editor.
- **Backend Server**: An Express.js application that manages the PostgreSQL database and orchestrates contest sessions.
- **Load Balancer**: A queue-based submission handler that facilitates asynchronous code evaluation and result broadcasting.

---

## Projects

### Client (Frontend)
**Configuration File**: [./client/package.json](./client/package.json)

#### Language & Runtime
**Language**: JavaScript (React 19)  
**Version**: Node.js compatible (ES Modules)  
**Build System**: Vite 7  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `react`: ^19.2.0
- `react-router-dom`: ^7.13.0
- `socket.io-client`: ^4.8.3
- `@monaco-editor/react`: ^4.7.0 (Code editing)
- `axios`: ^1.13.4
- `tailwindcss`: ^3.4.19

#### Build & Installation
```bash
cd client
npm install
npm run dev   # Runs on port 5173
npm run build # Generates production build
```

#### Testing
**Framework**: None explicitly configured (ESLint for linting)
**Naming Convention**: N/A
**Run Command**:
```bash
npm run lint
```

---

### Backend Server
**Configuration File**: [./server/package.json](./server/package.json)

#### Language & Runtime
**Language**: Node.js (CommonJS)  
**Version**: Node.js 18+ (estimated)  
**Build System**: Node.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `express`: ^5.2.1
- `pg`: ^8.18.0 (PostgreSQL client)
- `socket.io`: ^4.8.3
- `jsonwebtoken`: ^9.0.3 (Authentication)
- `dotenv`: ^17.2.3

#### Build & Installation
```bash
cd server
npm install
node index.js # Runs on port 3000 (default)
```

#### Main Files & Resources
- **Entry Point**: [./server/index.js](./server/index.js)
- **Database Logic**: [./server/db/index.js](./server/db/index.js)
- **Routes**: Includes `/auth`, `/question`, `/cascade`, `/rapidfire`, `/dsa`, and `/admin`.
- **Scripts**: Extensive database maintenance and migration scripts in `server/scripts/`.

---

### Load Balancer (Submission Service)
**Configuration File**: [./load-balancer/package.json](./load-balancer/package.json)

#### Language & Runtime
**Language**: Node.js (CommonJS)  
**Build System**: Node.js  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `bullmq`: ^5.67.2 (Queue management)
- `pg`: ^8.17.2
- `socket.io`: ^4.8.3
- `socket.io-client`: ^4.8.3
- `axios`: ^1.13.4

#### Build & Installation
```bash
cd load-balancer
npm install
node server.js # Runs on port 3100
```

#### Key Resources
- **Main Entry Point**: [./load-balancer/server.js](./load-balancer/server.js)
- **Configuration**: [./load-balancer/config.js](./load-balancer/config.js) (Redis and PG settings)
- **Dispatcher**: [./load-balancer/dispatcher.js](./load-balancer/dispatcher.js) handles job distribution.
