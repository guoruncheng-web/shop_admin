# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program E-commerce system with a full-stack architecture:
- **Backend**: NestJS (Node.js + TypeScript) API service with MySQL + Redis
- **Admin Frontend**: Vue 3 + Vben Admin framework for management dashboard
- **H5 Frontend**: Next.js for mobile H5 e-commerce site
- **Database**: MySQL 8.0 with comprehensive RBAC permission system

## Development Commands

### Backend (NestJS)
```bash
cd backend

# Development
npm run start:dev              # Standard development server
npm run start:dev-env          # Development with NODE_ENV=development
npm run start:test-env         # Testing environment
npm run start:prod-env         # Production environment

# Alternative environment startup
npm run env:dev                # Using shell script for development
npm run env:test               # Using shell script for testing
npm run env:prod               # Using shell script for production

# Build and Production
npm run build                  # Build the application
npm run start:prod             # Start production server

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Run tests with coverage
npm run test:e2e               # Run end-to-end tests

# Code Quality
npm run lint                   # Run ESLint with auto-fix
npm run format                 # Format code with Prettier
```

### Admin Frontend (Vben Admin)
```bash
cd frontend/vben-admin

# Development
pnpm dev:ele                   # Start the admin dashboard in development
pnpm build:ele                 # Build the admin dashboard for production
pnpm check:type                # Run TypeScript type checking

# Root level commands (from vben-admin directory)
pnpm dev                       # Start development server
pnpm build                     # Build for production
pnpm lint                      # Run linting
pnpm format                    # Format code
```

### H5 Frontend (Next.js)
```bash
cd frontend/h5-ecommerce

# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
```

## Architecture Overview

### Backend Architecture (NestJS)
- **Modular Structure**: Each business domain has its own module (auth, menus, users, roles, permissions, resources, etc.)
- **Authentication**: Session + Cookie based authentication with Redis session storage
- **Authorization**: RBAC (Role-Based Access Control) with three permission levels:
  - Menu permissions (controls sidebar visibility)
  - Route permissions (controls page access)
  - Button permissions (controls operation buttons)
- **Database**: TypeORM with MySQL, entities auto-discovered from `**/*.entity{.ts,.js}`
- **Caching**: Redis for session storage and permission caching
- **Logging**: Comprehensive login logs and operation logs with Winston
- **File Upload**: Tencent Cloud COS integration for file storage

### Key Backend Modules
- `src/auth/`: Authentication module with JWT and session strategies
- `src/modules/menus/`: Menu management with tree structure support
- `src/modules/roles/`: Role management system
- `src/modules/permissions/`: Permission management system
- `src/modules/login-log/`: Login activity tracking
- `src/modules/upload/`: File upload handling with chunk upload support
- `src/modules/resource/`: Resource pool management system
- `src/database/entities/`: TypeORM entity definitions

### Frontend Architecture (Admin)
- **Framework**: Vue 3 + TypeScript with Vben Admin UI framework
- **Routing**: Dynamic routing based on user permissions from backend
- **State Management**: Pinia for state management
- **API Layer**: Centralized request client with interceptors
- **Permission Control**: 
  - Route guards check access permissions
  - Component-level permission directives
  - API-driven menu generation

### Database Design
- **Multi-environment support**: Separate databases for dev/test/prod
- **RBAC Implementation**: admins -> roles -> permissions relationship
- **Menu System**: Hierarchical tree structure with parent-child relationships
- **Audit Trails**: Comprehensive logging of user actions and login attempts

## Environment Configuration

The project supports multiple environments with different configurations:

### Environment Files
- `.env.development` - Development environment
- `.env.testing` - Testing environment  
- `.env.production` - Production environment

### Key Configuration Areas
- **Database**: Separate databases per environment (wechat_mall_dev, wechat_mall_test, wechat_mall_prod)
- **Redis**: Different DB numbers per environment (0 for dev/prod, 1 for test)
- **Security**: Different encryption rounds and password requirements per environment
- **API Documentation**: Enabled in dev/test, disabled in production

## Common Development Tasks

### Working with Permissions
- Permissions follow a hierarchical code structure: `module:submodule` (e.g., `system:admin`, `product:list`)
- Route permissions are prefixed with `route:` (e.g., `route:system`, `route:product:list`)
- Button permissions are prefixed with `btn:` (e.g., `btn:add`, `btn:edit`, `btn:delete`)

### Menu System
- Menus support tree structure with unlimited nesting
- Menu types: 1=Directory, 2=Menu, 3=Button
- Frontend automatically generates routes from backend menu API
- Menu permissions control sidebar visibility

### Database Migrations
- SQL migration files in `backend/database/migrations/`
- Manual migration execution via migration controllers
- Initialization scripts available for fresh database setup

### File Upload
- Supports both single file and chunk upload for large files
- Integrates with Tencent Cloud COS for cloud storage
- Upload endpoints: `/upload/single` and `/upload/chunk`

## Testing and Quality

### Backend Testing
- Jest for unit testing with TypeScript support
- E2E testing configuration available
- Coverage reporting enabled
- ESLint + Prettier for code quality

### API Documentation
- Swagger/OpenAPI documentation available at `/api/v1/docs` in development
- Comprehensive API documentation for all endpoints
- Authentication and permission requirements documented

## Deployment Notes

### Environment Variables Required
- Database connection details (host, port, username, password, database name)
- Redis connection details (host, port, password, database number)
- Session configuration (secret, timeout)
- File upload configuration (Tencent COS credentials)
- JWT configuration (secret, expiration)

### Production Considerations
- Database synchronization disabled in production
- API documentation disabled in production
- Enhanced security settings (bcrypt rounds, session configuration)
- Comprehensive logging and monitoring enabled

## Important File Locations

### Backend Key Files
- `src/app.module.ts` - Main application module with all imports
- `src/config/configuration.ts` - Centralized configuration management
- `backend/QUICK_START.md` - Detailed backend setup guide
- `backend/ENV_SUMMARY.md` - Environment configuration reference

### Frontend Key Files
- `frontend/vben-admin/apps/web-ele/src/api/` - API client definitions
- `frontend/vben-admin/apps/web-ele/src/router/` - Route configuration
- `frontend/vben-admin/apps/web-ele/src/views/system/` - Admin management pages

### Documentation
- `docs/后台登录权限设计.md` - Comprehensive authentication and authorization design
- `README.md` - Project overview and quick start guide

## Development Workflow

1. **Setup**: Ensure MySQL and Redis are running with proper configurations
2. **Backend**: Start with `npm run start:dev` from backend directory
3. **Frontend**: Start with `pnpm dev:ele` from vben-admin directory
4. **Database**: Initialize with SQL files in `database/` directory if needed
5. **Testing**: Access API docs at `http://localhost:3000/api/v1/docs`