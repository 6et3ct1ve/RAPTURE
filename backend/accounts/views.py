import logging
import requests
import json
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password
from .models import User, Discord_User
from .serializers import (
    UserListSerializer,
    UserRegisterSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    DiscordSerializer,
)
from .permissions import IsAdmin
from . import secrets

logger = logging.getLogger("accounts")

class CheckDiscordView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.discord_id is None:
            return Response(status=404)
        else:    
            serializer = DiscordSerializer(request.user.discord_id)
            return Response(serializer.data, status=200)

class DiscordLinkingView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({'error' : 'code variable not present', 'code' : code}, status=400)
        print(code, secrets.DISCORD_CLIENT_ID, secrets.DISCORD_SECRET_ID, secrets.CALLBACK_URL)
        token_req = requests.post(secrets.DISCORD_TOKEN_URL, data = {
            "client_id" : secrets.DISCORD_CLIENT_ID,
            "client_secret" : secrets.DISCORD_SECRET_ID,
            "grant_type": "authorization_code",
            "code" : code,
            "redirect_uri" : secrets.CALLBACK_URL,
        }) 
        token_req.raise_for_status()
        token_data = token_req.json()
        if not token_data["access_token"] or not token_data["token_type"]:
            return Response({'error': 'could not get access token'}, status=400)
        discord_user_req = requests.get(secrets.DISCORD_INFO_URL, headers = {"Authorization" : f'{token_data["token_type"]} {token_data["access_token"]}'})
        discord_user_req.raise_for_status()
        discord_user_data = discord_user_req.json()
        discord_user_data_ser = DiscordSerializer(data = discord_user_data)
        if discord_user_data_ser.is_valid():
            discord_user_data_ser = discord_user_data_ser.save()
        else:
            return Response(discord_user_data_ser.errors, status=400)
        
        user = request.user
        user.discord_id = discord_user_data_ser
        try:
            user.save() 
            request.user.refresh_from_db() 
            return Response(status=200)
        except:
            return Response({'error': "couldn't link user"}, status=400)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        logger.info(f"User registered: {user.username} (ID: {user.id})")


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserUpdateSerializer
        return UserListSerializer

    def perform_update(self, serializer):
        serializer.save()
        logger.info(
            f"Profile updated: {self.request.user.username} (ID: {self.request.user.id})"
        )


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [AllowAny]


class AdminUserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def perform_destroy(self, instance):
        logger.warning(
            f"Admin {self.request.user.username} deleted user: {instance.username} (ID: {instance.id})"
        )
        instance.delete()


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not check_password(old_password, user.password):
            logger.warning(
                f"Failed password change attempt: {user.username} (ID: {user.id})"
            )
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        logger.info(f"Password changed: {user.username} (ID: {user.id})")

        return Response(
            {"status": "Password changed successfully"}, status=status.HTTP_200_OK
        )
