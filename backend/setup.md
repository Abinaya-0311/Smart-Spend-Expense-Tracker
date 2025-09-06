# Quick Setup Guide for SmartSpend Backend

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set up Environment
```bash
cp .env.example .env
```

Edit the `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartspend_db
JWT_SECRET=your_super_secret_jwt_key_make_it_very_long_and_random
```

### 3. Create Database
Connect to MySQL and run:
```sql
CREATE DATABASE smartspend_db;
```

### 4. Start the Server
```bash
npm run dev
```

The server will start at `http://localhost:5000` and automatically create all database tables.

## 🧪 Test the API

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token and use it for authenticated requests:

### Create an Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Coffee",
    "amount": 4.50,
    "categoryId": 1,
    "date": "2024-01-15",
    "description": "Morning coffee"
  }'
```

### Get Expenses
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/expenses
```

## 📱 Frontend Integration

Your React frontend can now connect to the API at `http://localhost:5000/api`.

See `/examples/react-integration.js` for complete React integration examples with axios.

## ✅ What's Included

- ✅ User registration and authentication
- ✅ JWT-based security
- ✅ Expense CRUD operations
- ✅ Category management (default + custom)
- ✅ Budget management with alerts
- ✅ Advanced filtering and search
- ✅ Statistics and analytics
- ✅ Rate limiting and security
- ✅ CORS enabled for React frontend
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Database auto-initialization

## 🎯 Next Steps

1. Start the backend server
2. Test the API endpoints
3. Integrate with your React frontend using the provided examples
4. Customize categories, add more features as needed

Your backend is production-ready with proper security, error handling, and documentation! 🎉