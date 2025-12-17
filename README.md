# RAPTURE
Reviews And Player Thoughts Unified Rating Engine

## Description
Community gaming review platform with rating system and Steam integration.  
Features include user reviews, likes, comments, real-time notifications, Discord integration, and automated game import from Steam API.  
Built with REST API, JWT auth, role-based access control, and SQLite.

## Features
- 5-criteria game rating system
- User reviews
- Like/comment functionality
- Internal notification system
- Discord integration
- Steam API integration
- User statistics
- JWT authentication
- Role-based access control

## Technologies

### Backend
- Django REST Framework
- JWT authentication
- SQLite database
- Steam Web API
- Discord OAuth2

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

### 3. Backend Setup

**Create `.env` file in `backend/` directory from .env_example**

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

### 4. Frontend Setup

**Create `.env` file in `frontend/` directory from .env_example**

**Install dependencies and run:**
```bash
cd frontend
npm install
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:8000/admin/

## Project Structure
```
RAPTURE/
├── backend/
│   ├── accounts/          # User auth, Discord integration
│   ├── games/             # Game models, Steam API integration
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
- `POST /api/accounts/token/` - Login (get JWT)
- `GET /api/accounts/profile/` - Get current user profile

### Games
- `GET /api/games/` - List games (paginated)
- `POST /api/games/` - Create game (admin)
- `GET /api/games/{id}/` - Game details
- `GET /api/games/steam/search/?q=query` - Search Steam games (admin)
- `POST /api/games/steam/import/` - Import game from Steam (admin)
- `POST /api/games/steam/bulk-import/` - Bulk import popular games (admin)

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
