from rest_framework import serializers
from .models import Game


class GameListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = ["id", "title", "steam_app_id", "developer", "release_date"]


class GameDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = "__all__"


class GameCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = "__all__"


class GameUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Game
        fields = "__all__"
