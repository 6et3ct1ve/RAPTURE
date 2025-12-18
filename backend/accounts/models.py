from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class Discord_User(models.Model):
    id = models.TextField(primary_key=True)
    username = models.TextField(max_length=32)
    global_name = models.TextField(max_length=32)
    linked_at = models.DateTimeField(auto_now_add=True)


class User(AbstractUser):
    ROLES = [
        ("user", "User"),
        ("admin", "Admin"),
    ]
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    role = models.CharField(max_length=10, choices=ROLES, default="user")
    created_at = models.DateTimeField(auto_now_add=True)
    email_verified = models.BooleanField(default=False)
    discord_id = models.OneToOneField(
        Discord_User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.username
