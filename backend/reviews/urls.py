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
    path("user/<int:user_id>/", views.UserReviewsView.as_view(), name="user-reviews"),
    path(
        "admin/<int:pk>/",
        views.AdminReviewDeleteView.as_view(),
        name="admin-review-delete",
    ),
    path(
        "comments/admin/<int:pk>/",
        views.AdminCommentDeleteView.as_view(),
        name="admin-comment-delete",
    ),
]
