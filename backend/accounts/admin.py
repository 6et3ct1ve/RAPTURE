from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Discord_User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ["username", "email", "role", "unique_id", "is_staff", "discord_id"]
    list_filter = ["role", "is_staff", "is_superuser"]

    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("role", "unique_id")}),
    )

    readonly_fields = ["unique_id"]

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Custom Fields", {"fields": ("role",)}),
    )

@admin.register(Discord_User)
class DiscordAdmin(admin.ModelAdmin):
    model = Discord_User
    list_display = ['id', 'username', 'global_name', 'linked_at']

admin.site.register(User, CustomUserAdmin)
