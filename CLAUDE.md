# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program e-commerce system with a complete admin backend. The project consists of:

1. **Backend API** - NestJS-based backend services
2. **Admin Frontend** - Vue 3 + Ant Design Vue admin dashboard (Vben Admin)
3. **WeChat Mini Program** - Taro-based frontend for users
4. **Database** - MySQL with complete schema and stored procedures

## Repository Structure

```
cursor_shop/
├── backend/           # NestJS backend API services
├── database/          # MySQL database schema, data, and procedures
├── docs/              # Documentation
├── frontend/          # Frontend applications
│   └── vben-admin/    # Vue 3 admin dashboard (monorepo structure)
└── README.md          # Main project documentation
```

## Common Development Tasks

### Backend Development (NestJS)

**Start development server:**
```bash
cd backend
npm run start:dev
```

**Build for production:**
```bash
cd backend
npm run build
```

**Run tests:**
```bash
cd backend
npm run test
```

**Code formatting:**
```bash
cd backend
npm run format
npm run lint
```

**API Documentation:**
Available at http://localhost:3000/api/v1/docs when server is running

### Frontend Development (Vben Admin)

**Install dependencies:**
```bash
cd frontend/vben-admin
pnpm install
```

**Start development server:**
```bash
cd frontend/vben-admin
pnpm run dev:antd
```

**Build for production:**
```bash
cd frontend/vben-admin
pnpm run build:antd
```

**Code checking:**
```bash
cd frontend/vben-admin
pnpm run check
pnpm run lint
pnpm run format
```

### Database Management

**Initialize database:**
```bash
cd database
mysql -u root -p < schema.sql
mysql -u root -p < data.sql
mysql -u root -p < procedures.sql
```

## Architecture Overview

### Backend Architecture
- **Framework**: NestJS (TypeScript)
- **Database**: MySQL with TypeORM
- **Authentication**: JWT + Session
- **Documentation**: Swagger/OpenAPI
- **Caching**: Redis
- **Logging**: Winston

### Frontend Architecture
- **Framework**: Vue 3 + TypeScript
- **UI Library**: Ant Design Vue
- **Build Tool**: Vite
- **State Management**: Pinia
- **Monorepo**: Turbo + pnpm

### Database Architecture
- **Core Tables**: Users, Products, Orders, Categories
- **Stored Procedures**: Business logic in database
- **Triggers**: Automatic data updates
- **Indexes**: Optimized for performance

## Key Features

1. **Admin Dashboard**: Complete RBAC permission system
2. **Product Management**: Three-level categories, SKUs
3. **Order Management**: Full order lifecycle
4. **User Management**: User levels, addresses
5. **Marketing Tools**: Coupons, discounts
6. **Logging**: Login and operation logs
7. **WeChat Integration**: Mini Program frontend

## Environment Requirements

- **Node.js**: >= 16.0
- **MySQL**: >= 8.0
- **Redis**: >= 6.2
- **pnpm**: For frontend (vben-admin)
- **npm**: For backend