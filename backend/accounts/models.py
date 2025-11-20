from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    ROLES = [
        ("user", "User"),
        ("admin", "Admin"),
    ]

    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    role = models.CharField(max_length=10, choices=ROLES, default="user")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
