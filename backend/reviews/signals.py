from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Like, Comment
from notifications.models import Notification


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if created:
        review = instance.review
        if review.user != instance.user:
            Notification.objects.create(
                user=review.user,
                message=f"{instance.user.username} liked your review of {review.game.title}",
            )


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        review = instance.review
        if review.user != instance.user:
            Notification.objects.create(
                user=review.user,
                message=f"{instance.user.username} commented on your review of {review.game.title}",
            )
