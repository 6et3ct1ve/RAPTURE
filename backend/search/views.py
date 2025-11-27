from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from games.models import Game
from games.serializers import GameListSerializer
from reviews.models import Review
from reviews.serializers import ReviewListSerializer


class GameSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "")

        if not query:
            return Response({"results": []})

        games = Game.objects.filter(
            Q(title__icontains=query)
            | Q(developer__icontains=query)
            | Q(publisher__icontains=query)
        )[:20]

        serializer = GameListSerializer(games, many=True)
        return Response({"results": serializer.data})


class ReviewSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get("q", "")

        if not query:
            return Response({"results": []})

        reviews = Review.objects.select_related("user", "game").filter(
            user__username__icontains=query
        )[:20]

        serializer = ReviewListSerializer(reviews, many=True)
        return Response({"results": serializer.data})
