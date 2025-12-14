from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('password/', views.PasswordChangeView.as_view(), name='password-change'),
    path('admin/<int:pk>/', views.AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('discord/callback/', views.DiscordLinkingView.as_view(), name='discord-linking'),
    path('discord/user/', views.CheckDiscordView.as_view(), name='discord-linking'),
]