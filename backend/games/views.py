from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests
import time
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


class SteamSearchView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query or len(query) < 2:
            return Response({"results": []})

        try:
            url = "https://api.steampowered.com/IStoreService/GetAppList/v1/"
            params = {
                "key": settings.STEAM_API_KEY,
                "include_games": True,
                "include_dlc": False,
                "include_software": False,
                "include_videos": False,
                "max_results": 50000,
            }

            response = requests.get(url, params=params, timeout=30)

            if response.status_code != 200:
                return Response(
                    {"error": "Steam API unavailable"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            data = response.json()
            apps = data.get("response", {}).get("apps", [])

            query_lower = query.lower()
            filtered = [
                {"appid": app["appid"], "name": app["name"]}
                for app in apps
                if query_lower in app["name"].lower()
            ][:50]

            return Response({"results": filtered})

        except requests.Timeout:
            return Response(
                {"error": "Steam API timeout"},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SteamImportView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        appid = request.data.get("appid")

        if not appid:
            return Response(
                {"error": "appid required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if Game.objects.filter(steam_app_id=appid).exists():
            return Response(
                {"error": "Game already exists"}, status=status.HTTP_409_CONFLICT
            )

        try:
            url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
            response = requests.get(url, timeout=10)

            if response.status_code != 200:
                return Response(
                    {"error": "Steam API unavailable"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            data = response.json()

            if not data.get(str(appid), {}).get("success"):
                return Response(
                    {"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND
                )

            game_data = data[str(appid)]["data"]

            if game_data.get("type") != "game":
                return Response(
                    {"error": "Not a game (might be DLC)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            game = Game.objects.create(
                steam_app_id=appid,
                title=game_data.get("name", "")[:255],
                description=game_data.get("short_description", "")[:500],
                developer=", ".join(game_data.get("developers", []))[:255],
                publisher=", ".join(game_data.get("publishers", []))[:255],
            )

            serializer = GameDetailSerializer(game)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SteamBulkImportView(APIView):
    permission_classes = [IsAdmin]

    def get_popular_appids(self, limit):
        try:
            url = "https://store.steampowered.com/api/featured/"
            response = requests.get(url, timeout=10)

            if response.status_code != 200:
                return []

            data = response.json()
            appids = []

            for game in data.get("featured_win", []):
                if "id" in game:
                    appids.append(game["id"])
                    if len(appids) >= limit:
                        break

            for game in data.get("large_capsules", []):
                if "id" in game and game["id"] not in appids:
                    appids.append(game["id"])
                    if len(appids) >= limit:
                        break

            return appids

        except:
            return []

    def post(self, request):
        limit = request.data.get("limit", 20)
        limit = min(int(limit), 50)

        appids = self.get_popular_appids(limit)

        if not appids:
            return Response(
                {"error": "Failed to fetch popular games"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        imported = 0
        skipped = 0

        for appid in appids:
            if Game.objects.filter(steam_app_id=appid).exists():
                skipped += 1
                continue

            try:
                url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
                response = requests.get(url, timeout=10)

                if response.status_code == 200:
                    data = response.json()

                    if data.get(str(appid), {}).get("success"):
                        game_data = data[str(appid)]["data"]

                        if game_data.get("type") == "game":
                            Game.objects.create(
                                steam_app_id=appid,
                                title=game_data.get("name", "")[:255],
                                description=game_data.get("short_description", "")[
                                    :500
                                ],
                                developer=", ".join(game_data.get("developers", []))[
                                    :255
                                ],
                                publisher=", ".join(game_data.get("publishers", []))[
                                    :255
                                ],
                            )
                            imported += 1

                time.sleep(1.5)

            except:
                continue

        return Response(
            {"imported": imported, "skipped": skipped, "total": imported + skipped}
        )
