# Chat Monorepo

A modern, scalable **real-time chat application** built with a monorepo architecture, featuring instant messaging with Socket.io, secure user authentication, profile management with location detection, and a fully responsive user interface.

[Chat-monrepo](https://chat-monorepo.vercel.app/login)

## ✨ Features

- **Real-time Messaging** - Instant message delivery using Socket.io connections
- **User Authentication** - Secure JWT-based login and registration system  
- **Profile Management** - Complete profile settings with location detection
- **Responsive Design** - Mobile-first approach with seamless desktop experience
- **Multi-platform Support** - Web and mobile applications from a single codebase
- **Scalable Architecture** - Modular monorepo structure for easy maintenance and scaling
- **Type Safety** - Full TypeScript implementation across all packages

## 🏗️ Project Architecture

This project follows a **monorepo architecture pattern**, organizing code into focused packages:

```
chat-monorepo/
├── apps/                          # Application packages
│   ├── api/                       # Express.js API server
│   │   ├── dist/                  # Compiled output
│   │   ├── src/                   # Source code
│   │   │   ├── config/           # Configuration files
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── routes/           # API route handlers
│   │   │   ├── auth.ts           # Authentication logic
│   │   │   ├── seeds.ts          # Database seeding
│   │   │   ├── server.ts         # Socket.io server
│   │   │   └── storage.ts        # File storage utilities
│   │   └── uploads/              # File upload directory
│   └── web/                      # Next.js web application
│       ├── .next/               # Next.js build output
│       ├── app/                 # App router pages
│       │   ├── (auth)/          # Authentication pages
│       │   │   ├── login/       # Login page
│       │   │   └── register/    # Registration page
│       │   └── chat/            # Chat interface
│       ├── components/          # React components
│       │   ├── pages/           # Page-specific components
│       │   └── ui/              # Reusable UI components
│       ├── contexts/            # React contexts
│       ├── lib/                 # Utility libraries
│       │   ├── hooks/           # Custom React hooks
│       │   └── utils/           # Helper functions
│       └── node_modules/        # Dependencies
```

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 with TypeScript
- **Meta Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS (Utility-first CSS framework)
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)
- **Location Services**: OpenCage Geocoding API

### **Backend**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Caching**: Redis (via Upstash)

### **Development Tools**
- **Package Manager**: npm/yarn/pnpm workspaces
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git
- **Containerization**: Docker

### **Deployment & Infrastructure**
- **Web Hosting**: Vercel
- **API Hosting**: Render
- **Database**: MongoDB Atlas
- **Cache**: Upstash Redis
- **File Storage**: Cloudinary
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Package Manager**: npm, yarn, or pnpm (v8 or higher)
- **Docker** (optional, for containerized development) - [Download here](https://www.docker.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdurrahman-Abdulhakeem/chat-monorepo.git
   cd chat-monorepo
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm run install:all
   
   # Using yarn
   yarn install:all
   
   # Using pnpm
   pnpm install:all
   ```

3. **Environment Configuration**
   
   Copy the environment template and configure your variables:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Shared Configuration
   CORS_ORIGIN=http://localhost:3000
   
   # API Server Configuration
   PORT=4000
   MONGO_URL=mongodb://root:example@localhost:27017
   MONGO_DB=chat
   REDIS_URL=redis://localhost:6379
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   
   # Cloudinary Configuration (for file uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   BASE_URL=http://localhost:4000
   
   # Web Application Configuration
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_api_key
   ```

4. **Database Setup**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   # Start MongoDB and Redis using Docker Compose
   docker-compose up -d database redis
   ```
   
   **Option B: Local Installation**
   - Install MongoDB locally and ensure it's running
   - Install Redis locally and ensure it's running

5. **Start Development Servers**
   ```bash
   # Start all services simultaneously
   npm run dev
   
   # Or start services individually
   npm run dev:web    # Web application (http://localhost:3000)
   npm run dev:api    # API server (http://localhost:4000)
   ```

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all development servers |
| `npm run dev:web` | Start Next.js web application only |
| `npm run dev:api` | Start Express API server only |
| `npm run build` | Build all packages for production |
| `npm run build:web` | Build web application for production |
| `npm run build:api` | Build API server for production |
| `npm run lint --prefix apps/web` | Run ESLint on frontend |

## 📦 Building for Production

### Build All Packages
```bash
npm run build
# or
pnpm build
```

### Build Specific Components
```bash
# Build web application
npm run build:web

# Build API server  
npm run build:api
```

### Production Preview
```bash
npm run start
```

## 🚢 Deployment

This application is designed for modern cloud deployment:

### **Web Application**
- **Platform**: [Vercel](https://vercel.com) (Recommended)
- **Alternative**: Netlify, AWS Amplify

### **API Services**
- **Platform**: [Render](https://render.com) (Current)
- **Alternative**: Railway, Heroku, AWS ECS

### **Database & Infrastructure**
- **Database**: MongoDB Atlas
- **Cache**: [Upstash Redis](https://upstash.com)
- **File Storage**: [Cloudinary](https://cloudinary.com)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### **Getting Started**
1. **Fork** this repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature
4. **Make** your changes
5. **Test** your changes thoroughly
6. **Submit** a pull request

### **Branch Naming Convention**
```bash
feature/your-feature-name    # New features
fix/issue-description        # Bug fixes  
docs/documentation-update    # Documentation changes
refactor/code-improvement    # Code refactoring
```

### **Commit Message Format**
```bash
feat: add user profile settings
fix: resolve socket connection issues
docs: update API documentation
refactor: improve authentication middleware
```

### **Development Workflow**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Zod schema validation for all inputs
- **Rate Limiting** - Protection against API abuse
- **CORS Configuration** - Properly configured cross-origin requests
- **Environment Variables** - Sensitive data stored securely
- **Password Hashing** - Bcrypt for secure password storage
- **SQL Injection Prevention** - MongoDB with Mongoose ODM
- **XSS Protection** - Input sanitization and validation

## 📊 Performance Optimizations

- **Code Splitting** - Automatic code splitting with Next.js
- **Database Indexing** - Optimized MongoDB queries
- **Caching Strategy** - Redis caching for improved performance  
- **Asset Optimization** - Image optimization with Cloudinary
- **Connection Pooling** - Efficient database connections
- **Progressive Web App** - PWA capabilities for mobile experience

## 👨‍💻 Author

**Abdurrahman Abdulhakeem**
- **Website**: [abdurrahman.ng](https://abdurrahman.ng)
- **GitHub**: [@Abdurrahman-Abdulhakeem](https://github.com/Abdurrahman-Abdulhakeem)
- **Twitter/X**: [@rammyscript](https://x.com/rammyscript)
- **Email**: [abdurrahmanola21@gmail.com](mailto:abdurrahmanola21@gmail.com)
- **LinkedIn**: [Abdurrahman Abdulhakeem](https://www.linkedin.com/in/abdurrahman-abdulhakeem-322890239)