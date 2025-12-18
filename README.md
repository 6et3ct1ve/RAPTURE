# RAPTURE
Reviews And Player Thoughts Unified Rating Engine

## Description
Community gaming review platform with rating system and Steam integration.  
Features include user reviews, likes, comments, real-time notifications, Discord integration, AI-powered recommendations, and automated game import from Steam API.  
Built with REST API, JWT auth, email verification, role-based access control, and SQLite.

## Features
- 5-criteria game rating system
- User reviews with likes and comments
- Email verification system (registration + password reset)
- Internal notification system
- Discord OAuth2 integration + bot notifications
- Steam API integration for game import
- AI game recommendations (Google Gemini)
- User statistics
- JWT authentication with refresh tokens
- Role-based access control

## Technologies

### Backend
- Django REST Framework
- JWT authentication
- SQLite database
- Steam Web API
- Discord OAuth2 + Bot API
- Google Gemini AI
- Gmail SMTP**
- APScheduler (background tasks)

### Frontend
- React
- React Router
- Axios

## Setup Instructions

### Prerequisites
- Python 3.12
- Node.js 16+
- Discord Application (for OAuth)
- Steam API Key
- Google Gemini API Key
- Gmail account with App Password

### 1. Discord Application Setup
1. Go to https://discord.com/developers/applications
2. Create New Application
3. Navigate to OAuth2 => General
4. Add redirect URI
5. Copy Client ID and Client Secret
6. Go to Bot tab, create bot and copy Bot Token

### 2. Steam API Key
1. Go to https://steamcommunity.com/dev/apikey
2. Register for API key
3. Copy your key

### 3. **Google Gemini API Key**
1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Copy your key

### 4. **Gmail SMTP Setup**
1. Enable 2-Step Verification at https://myaccount.google.com/security
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Copy 16-character password

### 5. Backend Setup

**Create `.env` file in `backend/` directory:**

**Install dependencies and run:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 6. Frontend Setup

**Create `.env` file in `frontend/` directory:**

**Install dependencies and run:**

```bash
cd frontend
npm install
npm start
```

### 7. Access Application
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:8000/admin/

## Project Structure

```
RAPTURE/
├── backend/
│   ├── accounts/          # User auth, Discord, email verification
│   ├── games/             # Game models, Steam API, AI recommendations
│   ├── reviews/           # Review system, likes, comments
│   ├── notifications/     # Notification system
│   └── rapture/           # Django settings
└── frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   └── services/      # API service
    └── public/
```

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `GET /api/accounts/verify-email/<uidb64>/<token>/` - Verify email
- `POST /api/accounts/resend-verification/` - Resend verification
- `POST /api/accounts/login/` - Login (get JWT)
- `POST /api/accounts/password-reset/` - Request password reset
- `POST /api/accounts/password-reset-confirm/<uidb64>/<token>/` - Confirm reset
- `GET /api/accounts/profile/` - Get current user profile

### Games
- `GET /api/games/` - List games (paginated)
- `POST /api/games/` - Create game (admin)
- `GET /api/games/{id}/` - Game details
- `GET /api/games/steam/search/?q=query` - Search Steam games (admin)
- `POST /api/games/steam/import/` - Import game from Steam (admin)
- `POST /api/games/steam/bulk-import/` - Bulk import popular games (admin)
- `POST /api/games/ai-recommend/` - AI game recommendations

### Reviews
- `GET /api/reviews/` - List all reviews
- `POST /api/reviews/` - Create review
- `GET /api/reviews/{id}/` - Review details
- `POST /api/reviews/{id}/like/` - Like review
- `POST /api/reviews/{id}/comment/` - Comment on review

### Notifications
- `GET /api/notifications/` - Get user notifications
- `POST /api/notifications/{id}/mark-read/` - Mark as read

## Team Members
- Butsko Bohdan

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
