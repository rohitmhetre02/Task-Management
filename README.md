# Task Management API

A RESTful API built with Express.js and MongoDB for managing tasks with role-based access control (Admin and User roles).

---

## 🔑 Test Accounts (For Easy Testing)

Use these pre-created accounts for testing without registering new users.

### **Admin Account**
- **Name:** Amit  
- **Email:** amit@test.com  
- **Password:** amit@test.com  
- **Role:** admin  

### **User Account**
- **Name:** Priya  
- **Email:** priya@test.com  
- **Password:** priya@test.com  
- **Role:** user  

These help in testing:
- Admin vs User permissions  
- Task creation and access  
- Owner-only update/delete rules  
- Admin dashboards and user management  

---
## 🌟 Features

- **User Authentication** - JWT-based authentication with bcryptjs password hashing
- **Role-Based Access Control** - Admin and User roles with different permissions
- **Task Management** - Create, read, update, and delete tasks
- **Owner-Only Operations** - Users can only modify their own tasks
- **Admin Dashboard** - Admins can view and manage all tasks and users
- **User Management** - Admin-only user management and statistics
- **API Documentation** - Swagger/OpenAPI documentation available
- **Security** - Helmet.js for HTTP header security, CORS support
- **Validation** - Express-validator for request validation
- **Logging** - Morgan for HTTP request logging

## 📋 Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud - MongoDB Atlas recommended)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Environment Variables Explanation:**

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation (use a strong, random string)
- `JWT_EXPIRES_IN` - JWT token expiration time
- `CORS_ORIGIN` - Frontend URL for CORS configuration

### 4. Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Routes (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Tasks Routes (`/tasks`)
*All routes require authentication (Bearer token)*

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/tasks` | Get all tasks | Admin: all tasks, User: own tasks |
| POST | `/tasks` | Create new task | Authenticated users |
| GET | `/tasks/:id` | Get single task | Owner or Admin |
| PUT | `/tasks/:id` | Update task | Owner only |
| DELETE | `/tasks/:id` | Delete task | Owner only |

**Create Task Request:**
```json
{
  "title": "Complete project",
  "description": "Finish the task management system",
  "status": "In Progress",
  "priority": "High"
}
```

**Status Options:** `To Do`, `In Progress`, `Done`  
**Priority Options:** `Low`, `Medium`, `High`

**Task Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete project",
  "description": "Finish the task management system",
  "status": "In Progress",
  "priority": "High",
  "owner": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "John Doe"
  },
  "createdAt": "2025-11-21T10:30:00.000Z",
  "updatedAt": "2025-11-21T10:30:00.000Z"
}
```

### Admin Routes (`/admin`)
*Requires authentication and admin role*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all non-admin users |
| GET | `/admin/stats` | Get user statistics |
| DELETE | `/admin/users/:id` | Delete user account |

**Users Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-11-21T10:30:00.000Z"
  }
]
```

**Stats Response:**
```json
{
  "totalUsers": 5,
  "adminUsers": 2,
  "regularUsers": 3
}
```

## 🔐 Authentication

### Bearer Token
Include JWT token in the Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Storage
The token received from login/register response should be stored in the client's localStorage and included in all subsequent requests.

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  status: String (enum: ['To Do', 'In Progress', 'Done'], default: 'To Do'),
  priority: String (enum: ['Low', 'Medium', 'High'], default: 'Medium'),
  owner: ObjectId (ref: 'User', required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🗂️ Project Structure

```
Backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── tasksController.js       # Task CRUD operations
│   └── adminController.js       # Admin operations
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   ├── role.js                  # Role-based authorization
│   └── errorHandler.js          # Error handling middleware
├── models/
│   ├── User.js                  # User schema
│   └── Task.js                  # Task schema
├── routes/
│   ├── auth.js                  # Authentication routes
│   ├── tasks.js                 # Task routes
│   └── admin.js                 # Admin routes
├── utils/
│   └── validate.js              # Request validation utilities
├── server.js                    # Express app setup
├── swagger.js                   # Swagger/OpenAPI configuration
├── package.json                 # Dependencies
├── .env                         # Environment variables
└── README.md                    # This file
```

## 📝 Scripts

```bash
# Start server in development mode (with nodemon)
npm run dev

# Start server in production mode
npm start

# Run tests (if configured)
npm test
```

## 🔧 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logging
- **dotenv** - Environment variables
- **swagger-jsdoc** - Swagger/OpenAPI documentation
- **swagger-ui-express** - Swagger UI

### Dev Dependencies

- **nodemon** - Auto-restart on file changes

## 🐛 Error Handling

The API returns standardized error responses:

```json
{
  "message": "Error description"
}
```

### Common Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User lacks permission (e.g., non-owner trying to delete task)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcryptjs for secure password storage
- **Role-Based Access Control** - Admin and User permissions
- **Owner Verification** - Users can only modify their own tasks
- **Helmet.js** - HTTP security headers
- **CORS** - Cross-origin request handling
- **Request Validation** - Express-validator for input validation

## 📖 API Documentation

Swagger/OpenAPI documentation is available at:
```
http://localhost:5000/api/v1/docs
```

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

### Environment Variables for Production

Make sure to set these in your production environment:

- `NODE_ENV=production`
- `PORT=80` (or your production port)
- `MONGO_URI=<production-mongodb-uri>`
- `JWT_SECRET=<strong-random-string>`
- `CORS_ORIGIN=https://your-frontend-domain.com`

## 💡 Usage Examples

### Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task management system",
    "status": "In Progress",
    "priority": "High"
  }'
```

### Get All Tasks
```bash
curl http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a Task
```bash
curl -X PUT http://localhost:5000/api/v1/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "Done"
  }'
```

### Delete a Task
```bash
curl -X DELETE http://localhost:5000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔗 Related Projects

- **Frontend Repository** - React frontend application for this API

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Your Name / Organization

## 📞 Support

For issues or questions, please create an issue in the repository.

## 🎯 Future Enhancements

- [ ] Task filtering and sorting
- [ ] Task assignments to multiple users
- [ ] Comments and attachments on tasks
- [ ] Task notifications
- [ ] Activity logging
- [ ] Advanced search functionality
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Team collaboration features

---

**Last Updated:** November 21, 2025
