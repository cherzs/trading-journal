# Trading Journal - Full Stack Application

A modern trading journal application built with **Flask** (Backend API) and **React** (Frontend).

## 🏗️ Architecture

- **Backend**: Flask REST API with PostgreSQL database
- **Frontend**: React with TypeScript, Tailwind CSS, and modern UI components
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with SQLAlchemy ORM

## 📁 Project Structure

```
trading-journal/
├── backend/                 # Flask API Backend
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── routes.py           # API routes
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main App component
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS config
├── .env                    # Environment variables
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=akuntansi.cjwyqk8802ox.ap-southeast-2.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=trading_journal
   DB_USER=postgres
   DB_PASSWORD=your_password_here

   # Flask Configuration
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=your_secret_key_here
   JWT_SECRET_KEY=your_jwt_secret_key_here

   # Other Configuration
   DEBUG=True
   ```

5. **Run the Flask API:**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The React app will be available at `http://localhost:3000`

## 🔧 Features

### Backend (Flask API)
- ✅ User authentication with JWT
- ✅ User registration and login
- ✅ Trade CRUD operations
- ✅ Trade statistics and analytics
- ✅ User preferences management
- ✅ PostgreSQL database integration
- ✅ RESTful API design

### Frontend (React)
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ User authentication flows
- ✅ Dashboard with trade statistics
- ✅ Trade management (add, edit, delete, view)
- ✅ Form validation with React Hook Form
- ✅ TypeScript for type safety
- ✅ Mobile-responsive design

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Trades
- `GET /api/trades` - Get user trades (with pagination and filters)
- `POST /api/trades` - Create new trade
- `GET /api/trades/:id` - Get specific trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `GET /api/trades/stats` - Get trade statistics

### User Preferences
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences

## 🛠️ Development

### Backend Development
- The Flask API uses SQLAlchemy for database operations
- JWT tokens for authentication
- CORS enabled for frontend communication
- Environment variables for configuration

### Frontend Development
- React with TypeScript for type safety
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Axios for API communication

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable management
- Input validation and sanitization

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Configure environment variables
3. Install Python dependencies
4. Run with a WSGI server (Gunicorn)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve the static files with a web server (Nginx, Apache)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 