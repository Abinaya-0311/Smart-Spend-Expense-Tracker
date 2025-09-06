# SmartSpend Backend API

A secure and feature-rich REST API for the SmartSpend expense tracking application, built with Node.js, Express, and MySQL.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration, login, and password reset
- **Expense Management**: Full CRUD operations for expense tracking
- **Category System**: Default and custom categories with statistics
- **Budget Management**: Set and track budgets with alerts
- **Advanced Filtering**: Filter expenses by date, category, amount, and search terms
- **Data Analytics**: Monthly trends, category summaries, and spending statistics
- **Security**: Rate limiting, CORS, input validation, and SQL injection protection
- **Error Handling**: Comprehensive error handling with meaningful messages

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone or navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=smartspend_db
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret (use a long, random string in production)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE smartspend_db;
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` and automatically create the required database tables.

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and initialization
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── expenseController.js # Expense management logic
│   ├── categoryController.js# Category management logic
│   └── budgetController.js  # Budget management logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── errorHandler.js     # Global error handling
│   └── validation.js       # Input validation middleware
├── models/
│   ├── User.js             # User database model
│   ├── Expense.js          # Expense database model
│   ├── Category.js         # Category database model
│   └── Budget.js           # Budget database model
├── routes/
│   ├── index.js            # Main route handler
│   ├── auth.js             # Authentication routes
│   ├── expenses.js         # Expense routes
│   ├── categories.js       # Category routes
│   └── budgets.js          # Budget routes
├── examples/
│   └── react-integration.js # React frontend integration examples
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── server.js               # Main server file
└── README.md               # This file
```

## 🔗 API Endpoints

### Base URL: `http://localhost:5000/api`

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| PUT | `/auth/change-password` | Change password | Yes |
| DELETE | `/auth/account` | Delete user account | Yes |

### Expense Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/expenses` | Create new expense | Yes |
| GET | `/expenses` | Get expenses with filters | Yes |
| GET | `/expenses/:id` | Get expense by ID | Yes |
| PUT | `/expenses/:id` | Update expense | Yes |
| DELETE | `/expenses/:id` | Delete expense | Yes |
| GET | `/expenses/recent` | Get recent expenses | Yes |
| GET | `/expenses/stats` | Get expense statistics | Yes |
| GET | `/expenses/summary/category` | Get summary by category | Yes |
| GET | `/expenses/trends/monthly` | Get monthly trends | Yes |

### Category Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories/defaults` | Get default categories | No |
| POST | `/categories` | Create new category | Yes |
| GET | `/categories` | Get all categories | Yes |
| GET | `/categories/:id` | Get category by ID | Yes |
| PUT | `/categories/:id` | Update category | Yes |
| DELETE | `/categories/:id` | Delete category | Yes |
| GET | `/categories/:id/stats` | Get category statistics | Yes |
| GET | `/categories/:id/usage` | Get category usage over time | Yes |

### Budget Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/budgets` | Create new budget | Yes |
| GET | `/budgets` | Get all budgets | Yes |
| GET | `/budgets/current` | Get current month budgets | Yes |
| GET | `/budgets/alerts` | Get budget alerts | Yes |
| GET | `/budgets/summary` | Get budget summary | Yes |
| GET | `/budgets/:id` | Get budget by ID | Yes |
| PUT | `/budgets/:id` | Update budget | Yes |
| DELETE | `/budgets/:id` | Delete budget | Yes |
| PATCH | `/budgets/:id/toggle` | Toggle budget status | Yes |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

### Example Login Flow:
```javascript
// 1. Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// 2. Use token for authenticated requests
const expensesResponse = await fetch('http://localhost:5000/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📝 Request/Response Examples

### Create Expense
```javascript
POST /api/expenses
Authorization: Bearer your_token

{
  "title": "Coffee",
  "amount": 4.50,
  "categoryId": 1,
  "type": "expense",
  "description": "Morning coffee",
  "date": "2024-01-15"
}

// Response
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 123,
    "title": "Coffee",
    "amount": "4.50",
    "category_name": "Food & Dining",
    "type": "expense",
    "date": "2024-01-15",
    // ... other fields
  }
}
```

### Get Expenses with Filters
```javascript
GET /api/expenses?type=expense&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
Authorization: Bearer your_token

// Response
{
  "success": true,
  "data": {
    "expenses": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 🔧 React Frontend Integration

The API is designed to work seamlessly with React applications. See the complete integration examples in `/examples/react-integration.js`.

### Quick Setup with Axios:

1. **Install axios**
   ```bash
   npm install axios
   ```

2. **Create API service**
   ```javascript
   import axios from 'axios';

   const api = axios.create({
     baseURL: 'http://localhost:5000/api',
     timeout: 10000
   });

   // Add auth token to requests
   api.interceptors.request.use(config => {
     const token = localStorage.getItem('authToken');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

3. **Use in components**
   ```javascript
   // Login
   const login = async (email, password) => {
     const response = await api.post('/auth/login', { email, password });
     localStorage.setItem('authToken', response.data.data.token);
     return response.data;
   };

   // Create expense
   const createExpense = async (expenseData) => {
     const response = await api.post('/expenses', expenseData);
     return response.data;
   };
   ```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes, 10 auth requests per 15 minutes
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation for all endpoints
- **SQL Injection Protection**: Parameterized queries
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds

## 📊 Database Schema

### Users Table
- id, email, password, first_name, last_name, is_verified, created_at, updated_at

### Categories Table
- id, name, description, color, icon, user_id, is_default, created_at, updated_at

### Expenses Table
- id, title, amount, category_id, type, description, date, user_id, created_at, updated_at

### Budgets Table
- id, category_id, user_id, amount, period, start_date, end_date, is_active, created_at, updated_at

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in your production environment
2. Use a strong, unique `JWT_SECRET`
3. Configure your production database credentials
4. Set up proper CORS origins for your frontend domain

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

The API includes comprehensive error handling and validation. Test endpoints using:

- **Postman**: Import the API endpoints
- **curl**: Command line testing
- **Frontend integration**: Use the provided React examples

### Test the API:
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Add your frontend URL to `FRONTEND_URL` in `.env`
   - Check CORS configuration in `server.js`

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token format: `Bearer your_token`
   - Ensure user is verified

4. **Rate Limiting**
   - Wait for rate limit window to reset
   - Adjust limits in `server.js` if needed

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the examples in `/examples/react-integration.js`
3. Verify your `.env` configuration
4. Check server logs for detailed error messages

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding! 🎉**

The SmartSpend backend API is ready for integration with your React frontend. All endpoints are documented, secured, and ready for production use.