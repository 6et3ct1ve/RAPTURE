from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Game
from .permissions import IsAdmin
from .serializers import (
    GameListSerializer,
    GameDetailSerializer,
    GameCreateSerializer,
    GameUpdateSerializer,
)


class GameListView(generics.ListCreateAPIView):

    queryset = Game.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return GameCreateSerializer
        return GameListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [AllowAny()]


class GameDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Game.objects.all()

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return GameUpdateSerializer
        return GameDetailSerializer

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsAdmin()]
        return [AllowAny()]
