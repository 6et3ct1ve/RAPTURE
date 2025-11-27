from rest_framework import serializers
from django.db.models import Avg, F
from .models import Game


class GameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "title", "steam_app_id", "developer", "release_date"]


class GameDetailSerializer(serializers.ModelSerializer):
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    avg_gameplay = serializers.SerializerMethodField()
    avg_graphics = serializers.SerializerMethodField()
    avg_story = serializers.SerializerMethodField()
    avg_sound = serializers.SerializerMethodField()
    avg_replayability = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "id",
            "steam_app_id",
            "title",
            "description",
            "release_date",
            "developer",
            "publisher",
            "created_at",
            "reviews_count",
            "average_rating",
            "avg_gameplay",
            "avg_graphics",
            "avg_story",
            "avg_sound",
            "avg_replayability",
        ]

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(
            avg_rating=Avg(
                (
                    F("gameplay")
                    + F("graphics")
                    + F("story")
                    + F("sound")
                    + F("replayability")
                )
                / 5.0
            )
        )["avg_rating"]
        return round(avg, 1) if avg else 0

    def get_avg_gameplay(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("gameplay"))["avg"]
        return round(avg, 1) if avg else 0

    def get_avg_graphics(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("graphics"))["avg"]
        return round(avg, 1) if avg else 0

    def get_avg_story(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("story"))["avg"]
        return round(avg, 1) if avg else 0

    def get_avg_sound(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("sound"))["avg"]
        return round(avg, 1) if avg else 0

    def get_avg_replayability(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("replayability"))["avg"]
        return round(avg, 1) if avg else 0


class GameCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = "__all__"


class GameUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = "__all__"
