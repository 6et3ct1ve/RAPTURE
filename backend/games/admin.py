from django.contrib import admin
from .models import Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ["title", "steam_app_id", "developer", "release_date"]
    search_fields = ["title", "developer"]
    list_filter = ["release_date"]
