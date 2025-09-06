// React Frontend Integration Examples for SmartSpend Backend API
// Install axios first: npm install axios

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API EXAMPLES ====================

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName
    });
    
    // Save token and user data
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    // Save token and user data
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', {
      firstName: profileData.firstName,
      lastName: profileData.lastName
    });
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// ==================== EXPENSE API EXAMPLES ====================

// Create new expense
export const createExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', {
      title: expenseData.title,
      amount: parseFloat(expenseData.amount),
      categoryId: parseInt(expenseData.categoryId),
      type: expenseData.type || 'expense',
      description: expenseData.description || '',
      date: expenseData.date // Format: YYYY-MM-DD
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create expense' };
  }
};

// Get expenses with filters and pagination
export const getExpenses = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/expenses?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expenses' };
  }
};

// Get expense by ID
export const getExpenseById = async (expenseId) => {
  try {
    const response = await api.get(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expense' };
  }
};

// Update expense
export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await api.put(`/expenses/${expenseId}`, {
      title: expenseData.title,
      amount: parseFloat(expenseData.amount),
      categoryId: parseInt(expenseData.categoryId),
      type: expenseData.type,
      description: expenseData.description || '',
      date: expenseData.date
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update expense' };
  }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete expense' };
  }
};

// Get recent expenses
export const getRecentExpenses = async (limit = 10) => {
  try {
    const response = await api.get(`/expenses/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch recent expenses' };
  }
};

// Get expense statistics
export const getExpenseStats = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/expenses/stats?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expense statistics' };
  }
};

// ==================== CATEGORY API EXAMPLES ====================

// Get all categories
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch categories' };
  }
};

// Create new category
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', {
      name: categoryData.name,
      description: categoryData.description || '',
      color: categoryData.color || '#007bff',
      icon: categoryData.icon || '📦'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create category' };
  }
};

// Update category
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, {
      name: categoryData.name,
      description: categoryData.description || '',
      color: categoryData.color,
      icon: categoryData.icon
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update category' };
  }
};

// Delete category
export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete category' };
  }
};

// ==================== BUDGET API EXAMPLES ====================

// Get all budgets
export const getBudgets = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.period) params.append('period', filters.period);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    
    const response = await api.get(`/budgets?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch budgets' };
  }
};

// Create new budget
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets', {
      categoryId: parseInt(budgetData.categoryId),
      amount: parseFloat(budgetData.amount),
      period: budgetData.period || 'monthly',
      startDate: budgetData.startDate,
      endDate: budgetData.endDate
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create budget' };
  }
};

// Update budget
export const updateBudget = async (budgetId, budgetData) => {
  try {
    const response = await api.put(`/budgets/${budgetId}`, {
      amount: parseFloat(budgetData.amount),
      period: budgetData.period,
      startDate: budgetData.startDate,
      endDate: budgetData.endDate,
      isActive: budgetData.isActive
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update budget' };
  }
};

// Delete budget
export const deleteBudget = async (budgetId) => {
  try {
    const response = await api.delete(`/budgets/${budgetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete budget' };
  }
};

// Get budget alerts
export const getBudgetAlerts = async (threshold = 80) => {
  try {
    const response = await api.get(`/budgets/alerts?threshold=${threshold}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch budget alerts' };
  }
};

// ==================== REACT COMPONENT EXAMPLES ====================

// Example: Login Component
export const LoginComponent = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(formData);
      // Redirect to dashboard or update app state
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Example: Expense List Component
export const ExpenseListComponent = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenses(filters);
      setExpenses(response.data.expenses);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
        // Refresh the list
        fetchExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  if (loading) return <div>Loading expenses...</div>;

  return (
    <div>
      <h2>My Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <div className="expense-list">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <h3>{expense.title}</h3>
              <p>Amount: ${expense.amount}</p>
              <p>Category: {expense.category_name}</p>
              <p>Date: {expense.date}</p>
              <button onClick={() => handleDeleteExpense(expense.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example: Create Expense Component
export const CreateExpenseComponent = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryId: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createExpense(formData);
      // Reset form or redirect
      setFormData({
        title: '',
        amount: '',
        categoryId: '',
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      alert('Expense created successfully!');
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Expense</h2>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        required
      />
      <select
        value={formData.categoryId}
        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
        required
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.icon} {category.name}
          </option>
        ))}
      </select>
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Expense'}
      </button>
    </form>
  );
};