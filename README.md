# URL Shortener Backend

A robust and feature-rich URL shortening service built with Node.js, Express, and MongoDB. This backend service provides comprehensive URL shortening capabilities with user authentication, analytics tracking, and detailed click statistics.

## 🌟 Features

- **URL Shortening**: Generate short URLs with unique 7-character slugs
- **User Authentication**: JWT-based authentication system
- **Analytics Tracking**: Comprehensive click analytics with device, browser, and location data
- **Guest Support**: URL shortening for both authenticated and anonymous users
- **Dashboard**: User dashboard to manage and view URL statistics
- **Security**: Password hashing, CORS protection, and authorization checks

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Utilities**: nanoid for slug generation
- **Code Quality**: Prettier for code formatting

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd url-shortner-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   DB_URI=mongodb://localhost:27017
   DB_NAME=url_shortener
   PORT=8000
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🚀 API Endpoints

### Authentication Routes

#### POST `/api/v1/user/signup`

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User Created Successfully.",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/v1/user/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "You are loggedin.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET `/api/v1/user/verify-user`

Verify user authentication token.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

### URL Management Routes

#### POST `/api/v1/url/shorten`

Create a shortened URL. Works for both authenticated and guest users.

**Request Body:**

```json
{
  "url": "https://example.com/very-long-url-path"
}
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Url shortened successfully.",
  "data": {
    "_id": "65a1b2c3d4e5f67890123456",
    "slug": "abc1234"
  }
}
```

#### GET `/api/v1/url/my-urls`

Get all URLs created by the authenticated user.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "URL retrieved successfully.",
  "data": [
    {
      "_id": "65a1b2c3d4e5f67890123456",
      "originalUrl": "https://example.com/very-long-url-path",
      "totalClicks": 15,
      "slug": "abc1234"
    }
  ]
}
```

#### GET `/api/v1/url/:slug`

Redirect to the original URL and track analytics.

**Example:** `GET /api/v1/url/abc1234`

#### GET `/api/v1/url/stats/:slug`

Get detailed analytics for a specific URL.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Record Found Successfully.",
  "data": {
    "totalClicks": 150,
    "devices": [
      { "device": "Mobile", "count": 100 },
      { "device": "Desktop", "count": 50 }
    ],
    "browsers": [
      { "browser": "Chrome", "count": 120 },
      { "browser": "Firefox", "count": 30 }
    ],
    "operatingSystems": [
      { "operatingSystem": "Android", "count": 80 },
      { "operatingSystem": "Windows", "count": 70 }
    ],
    "countries": [
      { "country": "US", "count": 100 },
      { "country": "UK", "count": 50 }
    ],
    "recordList": [
      {
        "slug": "abc1234",
        "ip": "192.168.1.1",
        "device": "Mobile",
        "browser": "Chrome",
        "operatingSystem": "Android",
        "country": "US",
        "date": "2024-01-01T10:30:00.000Z"
      }
    ]
  }
}
```

#### DELETE `/api/v1/url/delete/:slug`

Delete a URL and its associated analytics data.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

## 🔧 Development Scripts

- `npm start` - Start the development server with nodemon
- `npm run format` - Format code using Prettier

## 📊 Analytics Features

The application tracks comprehensive analytics for each URL click:

- **Device Information**: Mobile, Tablet, Desktop
- **Browser Detection**: Chrome, Firefox, Safari, Edge
- **Operating System**: Windows, macOS, iOS, Android, Linux
- **Geographic Data**: Country based on IP headers
- **Referral Tracking**: Source of the click
- **Timestamps**: Exact time of each click

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins
- **Authorization Checks**: Users can only access their own URLs
- **Input Validation**: Comprehensive request validation

## 🗄️ Database Schema

### User Collection

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  timestamps: true
}
```

### URL Collection

```javascript
{
  createdBy: ObjectId (ref: User, optional),
  slug: String (unique),
  originalUrl: String,
  totalClicks: Number (default: 0),
  lastVisited: Date,
  timestamps: true
}
```

### Click Collection

```javascript
{
  urlId: ObjectId (ref: URL),
  slug: String,
  ip: String,
  userAgent: String,
  device: String,
  browser: String,
  os: String,
  country: String,
  referer: String,
  timestamps: true
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Farman Ali**

- GitHub: [farmanali6349](https://github.com/farmanali6349)

## 🙏 Acknowledgments

- Built with Express.js and MongoDB
- Uses nanoid for secure slug generation
- JWT for secure authentication
- Comprehensive analytics tracking system

---

**Note**: Make sure to configure your MongoDB connection string and JWT secret appropriately for production use.
