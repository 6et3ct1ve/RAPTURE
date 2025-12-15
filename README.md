# RAPTURE
Reviews And Player Thoughts Unified Rating Engine

## Description
Community gaming review platform with rating system.  
Features include user reviews, likes, comments, real-time notifications and Discord notifications.  
Built with REST API, JWT auth, role-based access control, and SQLite.

## Features
- 5-criteria game rating system
- User reviews
- Like/comment functionality  
- Internal notification system
- JWT authentication & authorization
- RESTful API architecture
- discord linking
- statistic system

## Technologies

### Backend
- Django
- JWT-tokens  
- SQLite
### Frontend
- React

## How to start

### Create Discord App

### Setup Your API Keys
Add secrets.py file into accounts folder and populate with following variables:
- DISCORD_OAUTH2_URL for your oauth generated url
- DISCORD_CLIENT_ID = for your discord app generated ID
- DISCORD_SECRET_ID = for your discord app secret ID
- CALLBACK_URL = for URL of your frontend profile (should be "http://localhost:3000/profile/")
- DISCORD_INFO_URL = usually "https://discord.com/api/users/@me"
- DISCORD_TOKEN_URL = usually "https://discord.com/api/oauth2/token"
- BOT_TOKEN = for bot token given to you by app

### 1) Migrate Everything

### 2) Activate venv ("source rapture/bin/activate" On Linux Systems)

### 3) Cd Into Backend And Install requirments (pip install -r requirements.txt)

### 4) Start Backend With python manage.py runserver

### 5) Create Another Terminal And Cd Into Frontend

### 6) Run npm install And Start Backend With npm start

### 7) Open http://localhost:3000 In Browser And Enjoy Or Whatever

## Team members
- Butsko Bohdan
- Mishchyshyn Volodymyr

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
