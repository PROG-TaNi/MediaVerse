# MongoDB Database Setup for MediaVerse

## 1. MongoDB Atlas Setup (Free Tier)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Choose the FREE tier (M0 Sandbox - 512MB storage)

### Step 2: Create a Cluster
1. After login, click "Create a New Cluster"
2. Choose "Shared Clusters" (Free)
3. Select your preferred cloud provider and region
4. Keep the default cluster name or change it
5. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with "mediaverse"

## 2. Environment Setup

### Step 1: Create .env file
```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Update .env with your MongoDB URI
```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.mongodb.net/mediaverse?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
PORT=5000
```

### Step 3: Generate JWT Secret
```bash
# Generate a random JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 3. Install Dependencies and Run

### Step 1: Install Backend Dependencies
```bash
npm install
```

### Step 2: Start the Backend Server
```bash
# Development mode
npm run dev

# Or create a dev script in package.json:
# "dev": "nodemon server/server.js"
```

### Step 3: Test the Connection
```bash
# Test health endpoint
curl http://localhost:5000/api/health
```

## 4. Database Collections Structure

### Users Collection
- Stores user profiles, preferences, favorites, watchlists
- Includes authentication data (hashed passwords)
- Tracks user interactions and history

### Content Collection (Optional - for caching)
- Caches frequently accessed content from external APIs
- Stores aggregated ratings and view counts
- Improves performance by reducing API calls

### UserInteractions Collection
- Logs all user activities (views, likes, ratings, searches)
- Used for recommendation algorithms
- Analytics and user behavior tracking

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Favorites
- `POST /api/favorites/add` - Add to favorites
- `DELETE /api/favorites/remove` - Remove from favorites
- `GET /api/favorites` - Get user favorites

## 6. Frontend Integration

### Update your React auth store to use real API:

```javascript
// In src/store/authStore.js
const API_BASE_URL = 'http://localhost:5000/api';

export const useAuthStore = create((set) => ({
  // ... existing state
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        set({ 
          user: data.user, 
          token: data.token, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));
```

## 7. Security Best Practices

1. **Never commit .env file** - Add it to .gitignore
2. **Use strong JWT secrets** - Generate random 64+ character strings
3. **Validate all inputs** - Use express-validator or joi
4. **Rate limiting** - Implement rate limiting for API endpoints
5. **HTTPS in production** - Always use HTTPS in production
6. **Regular backups** - MongoDB Atlas provides automatic backups

## 8. Monitoring and Maintenance

### MongoDB Atlas Dashboard
- Monitor database performance
- Set up alerts for high usage
- View slow queries and optimize indexes

### Logging
- Implement structured logging with Winston
- Monitor error rates and response times
- Set up alerts for critical errors

## 9. Scaling Considerations

### Free Tier Limits
- 512MB storage
- Shared CPU and RAM
- No backup retention

### Upgrade Path
- M2/M5 clusters for dedicated resources
- Automated backups and point-in-time recovery
- Advanced monitoring and alerting
- Multi-region deployments

## Troubleshooting

### Common Issues
1. **Connection timeout** - Check network access whitelist
2. **Authentication failed** - Verify username/password
3. **Database not found** - Ensure database name in connection string
4. **SSL errors** - Use `ssl=true` in connection string

### Debug Connection
```javascript
// Add to your database.js file for debugging
mongoose.set('debug', true);
```