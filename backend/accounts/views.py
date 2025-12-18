import logging
import requests
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from django.conf import settings
from .models import User, Discord_User
from .serializers import (
    UserListSerializer,
    UserRegisterSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    DiscordSerializer,
)
from .permissions import IsAdmin
from .tokens import email_verification_token

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
            return Response({"error": "code variable not present"}, status=400)

        token_req = requests.post(
            settings.DISCORD_TOKEN_URL,
            data={
                "client_id": settings.DISCORD_CLIENT_ID,
                "client_secret": settings.DISCORD_SECRET_ID,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.DISCORD_CALLBACK_URL,
            },
        )
        token_req.raise_for_status()
        token_data = token_req.json()

        if not token_data.get("access_token") or not token_data.get("token_type"):
            return Response({"error": "could not get access token"}, status=400)

        discord_user_req = requests.get(
            settings.DISCORD_INFO_URL,
            headers={
                "Authorization": f'{token_data["token_type"]} {token_data["access_token"]}'
            },
        )
        discord_user_req.raise_for_status()
        discord_user_data = discord_user_req.json()

        discord_user_data_ser = DiscordSerializer(data=discord_user_data)
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
            return Response({"error": "couldn't link user"}, status=400)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save(is_active=False)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token.make_token(user)

        redirect_path = self.request.data.get("redirect_path", "/")
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/?redirect={redirect_path}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px;">
                            <tr>
                                <td style="padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #a4b494; margin: 0 0 10px 0; font-size: 28px;">[ RAPTURE ]</h1>
                                    <h2 style="color: #fff; margin: 0 0 20px 0; font-size: 22px;">Verify Your Email</h2>
                                    <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Welcome, {user.username}! Click the button below to verify your email address and activate your account.
                                    </p>
                                    <a href="{verify_url}" style="display: inline-block; background-color: #a4b494; color: #000; text-decoration: none; padding: 14px 40px; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                        Verify Email
                                    </a>
                                    <p style="color: #888; font-size: 14px; margin: 30px 0 0 0;">
                                        Or copy this link:<br>
                                        <span style="color: #a4b494; word-break: break-all;">{verify_url}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 30px; border-top: 1px solid #333; text-align: center;">
                                    <p style="color: #666; font-size: 12px; margin: 0;">
                                        © 2025 Rapture | Game Review Platform
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        try:
            email = EmailMessage(
                subject="Verify your email - Rapture",
                body=html_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            email.content_subtype = "html"
            email.send()
        except Exception as e:
            logger.error(f"Email sending failed: {e}")

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


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid link"}, status=400)

        if not email_verification_token.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.is_active = True
        user.email_verified = True
        user.save()
        logger.info(f"Email verified: {user.username} (ID: {user.id})")

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Email verified successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=200,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_input = request.data.get("email")
        if not email_input:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email_input, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"message": "If email exists, reset link was sent"}, status=200
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px;">
                            <tr>
                                <td style="padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #a4b494; margin: 0 0 10px 0; font-size: 28px;">[ RAPTURE ]</h1>
                                    <h2 style="color: #fff; margin: 0 0 20px 0; font-size: 22px;">Reset Your Password</h2>
                                    <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Click the button below to reset your password. This link will expire in 24 hours.
                                    </p>
                                    <a href="{reset_url}" style="display: inline-block; background-color: #a4b494; color: #000; text-decoration: none; padding: 14px 40px; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                        Reset Password
                                    </a>
                                    <p style="color: #888; font-size: 14px; margin: 30px 0 0 0;">
                                        Or copy this link:<br>
                                        <span style="color: #a4b494; word-break: break-all;">{reset_url}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 30px; border-top: 1px solid #333; text-align: center;">
                                    <p style="color: #666; font-size: 12px; margin: 0;">
                                        © 2025 Rapture | Game Review Platform
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        try:
            email = EmailMessage(
                subject="Reset your password - Rapture",
                body=html_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            email.content_subtype = "html"
            email.send()
        except Exception as e:
            logger.error(f"Password reset email failed: {e}")

        return Response({"message": "If email exists, reset link was sent"}, status=200)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        new_password = request.data.get("new_password")
        if not new_password:
            return Response({"error": "New password is required"}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid link"}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.set_password(new_password)
        user.save()
        logger.info(f"Password reset: {user.username} (ID: {user.id})")

        return Response({"message": "Password reset successfully"}, status=200)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email, is_active=False, email_verified=False)
        except User.DoesNotExist:
            return Response(
                {"message": "If account exists and is unverified, email was sent"},
                status=200,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token.make_token(user)

        redirect_path = request.data.get("redirect_path", "/")
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/?redirect={redirect_path}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px;">
                            <tr>
                                <td style="padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #a4b494; margin: 0 0 10px 0; font-size: 28px;">[ RAPTURE ]</h1>
                                    <h2 style="color: #fff; margin: 0 0 20px 0; font-size: 22px;">Verify Your Email</h2>
                                    <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                        Welcome, {user.username}! Click the button below to verify your email address and activate your account.
                                    </p>
                                    <a href="{verify_url}" style="display: inline-block; background-color: #a4b494; color: #000; text-decoration: none; padding: 14px 40px; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                        Verify Email
                                    </a>
                                    <p style="color: #888; font-size: 14px; margin: 30px 0 0 0;">
                                        Or copy this link:<br>
                                        <span style="color: #a4b494; word-break: break-all;">{verify_url}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 30px; border-top: 1px solid #333; text-align: center;">
                                    <p style="color: #666; font-size: 12px; margin: 0;">
                                        © 2025 Rapture | Game Review Platform
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        try:
            email_message = EmailMessage(
                subject="Verify your email - Rapture",
                body=html_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email],
            )
            email_message.content_subtype = "html"
            email_message.send()
            logger.info(f"Verification email resent: {user.username} (ID: {user.id})")
        except Exception as e:
            logger.error(f"Email resend failed: {e}")

        return Response(
            {"message": "If account exists and is unverified, email was sent"},
            status=200,
        )
