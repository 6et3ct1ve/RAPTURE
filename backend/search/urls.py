from django.urls import path
from . import views

urlpatterns = [
    path("games/", views.GameSearchView.as_view(), name="search-games"),
    path("reviews/", views.ReviewSearchView.as_view(), name="search-reviews"),
]
