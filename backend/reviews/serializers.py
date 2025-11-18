from rest_framework import serializers
from .models import Review, Like, Comment


class ReviewListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    game_title = serializers.CharField(source="game.title", read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "username",
            "game_title",
            "gameplay",
            "graphics",
            "story",
            "sound",
            "replayability",
            "likes_count",
            "created_at",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()


class ReviewDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    game_title = serializers.CharField(source="game.title", read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "username",
            "game",
            "game_title",
            "gameplay",
            "graphics",
            "story",
            "sound",
            "replayability",
            "text",
            "likes_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]

    def get_likes_count(self, obj):
        return obj.likes.count()


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "game",
            "gameplay",
            "graphics",
            "story",
            "sound",
            "replayability",
            "text",
        ]


class ReviewUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = ["gameplay", "graphics", "story", "sound", "replayability", "text"]


class CommentListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "username", "text", "created_at"]


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["text"]
