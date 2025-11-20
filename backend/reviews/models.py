from django.db import models
from django.conf import settings
from games.models import Game
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="reviews")
    gameplay = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    graphics = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    story = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    sound = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    replayability = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "game"]

    def __str__(self):
        return f"{self.user.username} - {self.game.title}"


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "review"]


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review = models.ForeignKey(
        Review, on_delete=models.CASCADE, related_name="comments"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.text[:30]}"
