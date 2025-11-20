from django.contrib import admin
from .models import Review, Like, Comment


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["user", "game", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "game__title"]


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["user", "review", "created_at"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["user", "review", "text", "created_at"]
