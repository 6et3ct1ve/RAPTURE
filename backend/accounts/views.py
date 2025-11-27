import logging
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password
from .models import User
from .serializers import (
    UserListSerializer,
    UserRegisterSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
)
from .permissions import IsAdmin

logger = logging.getLogger("accounts")


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
