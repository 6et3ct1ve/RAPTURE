from django.urls import path
from . import views

urlpatterns = [
    path("", views.ReviewListView.as_view(), name="review-list"),
    path("<int:pk>/", views.ReviewDetailView.as_view(), name="review-detail"),
    path("<int:pk>/like/", views.LikeView.as_view(), name="review-like"),
    path(
        "<int:pk>/comments/",
        views.CommentListCreateView.as_view(),
        name="review-comments",
    ),
]
