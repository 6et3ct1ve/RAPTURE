from django.urls import path
from . import views

urlpatterns = [
    path("", views.GameListView.as_view(), name="game-list"),
    path("<int:pk>/", views.GameDetailView.as_view(), name="game-detail"),
    path("steam/search/", views.SteamSearchView.as_view(), name="steam-search"),
    path("steam/import/", views.SteamImportView.as_view(), name="steam-import"),
    path(
        "steam/bulk-import/",
        views.SteamBulkImportView.as_view(),
        name="steam-bulk-import",
    ),
]
