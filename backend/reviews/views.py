import logging
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import F
from .models import Review, Like, Comment
from .permissions import IsOwnerOrAdmin
from accounts.permissions import IsAdmin
from .serializers import (
    ReviewListSerializer,
    ReviewDetailSerializer,
    ReviewCreateSerializer,
    ReviewUpdateSerializer,
    CommentListSerializer,
    CommentCreateSerializer,
)

logger = logging.getLogger("reviews")


class ReviewListView(generics.ListCreateAPIView):
    queryset = Review.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReviewCreateSerializer
        return ReviewListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Review.objects.all()

        sort_by = self.request.query_params.get("sort_by", "-created_at")

        if sort_by == "rating_high":
            queryset = queryset.annotate(
                avg_rating=(
                    F("gameplay")
                    + F("graphics")
                    + F("story")
                    + F("sound")
                    + F("replayability")
                )
                / 5.0
            ).order_by("-avg_rating")
        elif sort_by == "rating_low":
            queryset = queryset.annotate(
                avg_rating=(
                    F("gameplay")
                    + F("graphics")
                    + F("story")
                    + F("sound")
                    + F("replayability")
                )
                / 5.0
            ).order_by("avg_rating")
        elif sort_by == "date_new":
            queryset = queryset.order_by("-created_at")
        elif sort_by == "date_old":
            queryset = queryset.order_by("created_at")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

    def perform_create(self, serializer):
        try:
            review = serializer.save(user=self.request.user)
            logger.info(
                f"Review created: User {self.request.user.username} reviewed game {review.game.title} (Review ID: {review.id})"
            )
        except IntegrityError:
            from rest_framework.exceptions import ValidationError

            logger.warning(
                f"Duplicate review attempt: User {self.request.user.username}"
            )
            raise ValidationError({"error": "You have already reviewed this game."})


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return ReviewUpdateSerializer
        return ReviewDetailSerializer

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [AllowAny()]

    def perform_update(self, serializer):
        review = serializer.save()
        logger.info(
            f"Review updated: Review ID {review.id} by user {self.request.user.username}"
        )

    def perform_destroy(self, instance):
        logger.info(
            f"Review deleted: Review ID {instance.id} by user {self.request.user.username}"
        )
        instance.delete()


class LikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response(
                {"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND
            )

        like, created = Like.objects.get_or_create(user=request.user, review=review)

        if not created:
            like.delete()
            return Response({"status": "unliked"}, status=status.HTTP_200_OK)

        return Response({"status": "liked"}, status=status.HTTP_201_CREATED)


class CommentListCreateView(generics.ListCreateAPIView):

    def get_queryset(self):
        review_id = self.kwargs["pk"]
        return Comment.objects.filter(review_id=review_id)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentCreateSerializer
        return CommentListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        review_id = self.kwargs["pk"]
        review = get_object_or_404(Review, pk=review_id)
        comment = serializer.save(user=self.request.user, review=review)
        logger.info(
            f"Comment created: User {self.request.user.username} commented on review {review_id} (Comment ID: {comment.id})"
        )


class UserReviewsView(generics.ListAPIView):
    serializer_class = ReviewListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return Review.objects.filter(user_id=user_id)


class AdminReviewDeleteView(generics.DestroyAPIView):
    queryset = Review.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def perform_destroy(self, instance):
        logger.warning(
            f"Admin {self.request.user.username} deleted review: Review ID {instance.id} by user {instance.user.username}"
        )
        instance.delete()


class AdminCommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]

    def perform_destroy(self, instance):
        logger.warning(
            f"Admin {self.request.user.username} deleted comment: Comment ID {instance.id} by user {instance.user.username}"
        )
        instance.delete()
