# notifications/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationListSerializer, NotificationUpdateSerializer


class NotificationListView(generics.ListAPIView):

    serializer_class = NotificationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationReadView(generics.UpdateAPIView):

    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDeleteView(generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
