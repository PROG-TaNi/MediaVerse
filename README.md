# MediaVerse - Media Discovery Platform

A comprehensive media discovery platform with support for movies, books, and music. Features include content browsing, reviews, ratings, and user profiles with profile picture upload functionality.

## Features

### Core Features
- **Content Discovery**: Browse movies, books, and music from local datasets
- **Search & Filter**: Advanced search functionality with filters
- **Reviews & Ratings**: Rate and review content
- **User Profiles**: Personal profiles with customizable settings
- **Infinite Scrolling**: Smooth browsing experience on movies page

### Profile Picture Upload
- **Click to Upload**: Click on the profile avatar to upload a new picture
- **Image Validation**: Supports common image formats (JPEG, PNG, GIF, etc.)
- **File Size Limit**: 5MB maximum file size
- **MongoDB Storage**: Profile pictures are stored in MongoDB database
- **Local File Storage**: Images are saved to local file system
- **Real-time Updates**: Profile picture updates immediately after upload

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** (optional) for user data and profile pictures
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

### Data Sources
- **Movies**: Local CSV dataset with OMDb API integration for posters
- **Books**: Goodreads 10k dataset with cover images ( from Kaggle )
- **Music**: Kaggle Dataset

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional, for full functionality)

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OMDB_API_KEY=your_omdb_api_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Profile Picture Upload Usage

### How to Upload a Profile Picture

1. **Navigate to Profile Page**: Go to `/profile` in the application
2. **Click the Avatar**: Click on the circular profile picture/avatar
3. **Select Image**: Choose an image file from your device
4. **Automatic Upload**: The image will be uploaded and displayed immediately

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- Other common image formats

### File Requirements
- **Maximum Size**: 5MB
- **Format**: Image files only
- **Dimensions**: Any size (will be automatically resized for display)

### Technical Implementation

#### Backend Routes
- `POST /api/users/profile-picture` - Upload profile picture
- `DELETE /api/users/profile-picture` - Remove profile picture
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/profile` - Get user profile

#### File Storage
- **Local Storage**: Images saved to `uploads/profile-pictures/`
- **Database**: Image URLs stored in MongoDB User model
- **Static Serving**: Images served via Express static middleware

#### Frontend Components
- **ProfilePage**: Main profile interface with upload functionality
- **File Input**: Hidden file input triggered by avatar click
- **Upload Progress**: Loading indicator during upload
- **Error Handling**: Validation and error messages

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Content
- `GET /api/movies` - Get movies with pagination
- `GET /api/books` - Get books with pagination
- `GET /api/music` - Get music with pagination
- `GET /api/content/:id` - Get specific content details

### Reviews
- `POST /api/reviews` - Create a review
- `GET /api/reviews/:contentId` - Get reviews for content
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile-picture` - Upload profile picture
- `DELETE /api/users/profile-picture` - Remove profile picture

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  profilePicture: String, // URL to uploaded image
  role: String, // 'user' or 'admin'
  favorites: {
    movies: [String],
    books: [String],
    music: [String],
    podcasts: [String],
    articles: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Running in Development Mode
```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
npm start
```

### File Structure
```
project/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── store/             # Zustand stores
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── server/                # Backend source
│   ├── routes/            # API routes
│   ├── models/            # MongoDB models
│   └── server.js          # Main server file
├── uploads/               # Uploaded files
│   └── profile-pictures/  # Profile pictures
└── datasets/              # Local CSV datasets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 
