from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "role", "unique_id", "created_at"]
    list_filter = ["role", "is_staff", "is_active"]
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("unique_id", "role")}),
    )
