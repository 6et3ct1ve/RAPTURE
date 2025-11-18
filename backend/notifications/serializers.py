from rest_framework import serializers
from .models import Notification


class NotificationListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "created_at"]


class NotificationUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = ["is_read"]
