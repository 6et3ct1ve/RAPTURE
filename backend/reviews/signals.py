from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Like, Comment
from notifications.models import Notification
from accounts.models import Discord_User, User
import discord
import asyncio


async def _dm_user(msg, user_id):
    client = discord.Client(intents=discord.Intents.default())
    try:
        await client.login(settings.BOT_TOKEN)
        client_user = await client.fetch_user(user_id.id)
        channel = await client_user.create_dm()
        await channel.send(msg)
    except discord.Forbidden:
        print(f"Cannot send DM to user {user_id.id} - DMs disabled")
    except Exception as e:
        print(f"Discord error: {e}")
    finally:
        await client.close()


def dm_user(msg, discord_id):
    asyncio.run(_dm_user(msg, discord_id))


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if created:
        review = instance.review
        print(review.user)
        if review.user != instance.user:
            message = (
                f"{instance.user.username} liked your review of {review.game.title}"
            )
            Notification.objects.create(
                user=review.user,
                message=message,
            )
            discord_id = None
            if review.user.discord_id:
                discord_id = review.user.discord_id
                print(discord_id)
                dm_user(message, discord_id)


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        review = instance.review
        if review.user != instance.user:
            message = f"{instance.user.username} commented on your review of {review.game.title}"
            Notification.objects.create(
                user=review.user,
                message=message,
            )
            discord_id = None
            if review.user.discord_id:
                discord_id = review.user.discord_id
                print(discord_id)
                dm_user(message, discord_id)
