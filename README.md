# TikTok Live Project

A microservices-based application for TikTok Live features.

## Microservices

### 1. Auth API (`/auth-api`)

Authentication and authorization service providing:
- User registration and login
- JWT-based authentication
- Refresh token rotation
- Role-based access control
- User profile management

[View Auth API Documentation](./auth-api/README.md)

## Getting Started

Each microservice is independent and can be run separately. Navigate to the respective service directory for specific setup instructions.

### Quick Start

1. **Install dependencies for each service**
   ```bash
   cd auth-api
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Copy example env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run the service**
   ```bash
   npm run dev
   ```

## Project Structure

```
tiktok-live-project/
├── auth-api/           # Authentication microservice
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── README.md
├── [other-services]/   # Future microservices
└── README.md          # This file
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcrypt, express-rate-limit
- **Testing**: Jest, Supertest
- **Development**: Nodemon

## Development

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn

### Running Tests

```bash
cd auth-api
npm test
```

## License

MIT