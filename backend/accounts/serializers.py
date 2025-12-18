from rest_framework import serializers
from .models import User, Discord_User
from reviews.models import Like
from django.db.models import Avg, F


class DiscordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discord_User
        fields = ["id", "username", "global_name"]


class UserListSerializer(serializers.ModelSerializer):
    reviews_count = serializers.SerializerMethodField()
    average_rating_given = serializers.SerializerMethodField()
    total_likes_received = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "email_verified",
            "role",
            "unique_id",
            "created_at",
            "reviews_count",
            "average_rating_given",
            "total_likes_received",
            "discord_id",
        ]

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_average_rating_given(self, obj):

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

    def get_total_likes_received(self, obj):
        return Like.objects.filter(review__user=obj).count()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError("New passwords do not match")
        return data
