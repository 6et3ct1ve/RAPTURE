from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
import logging

logger = logging.getLogger("accounts")


def delete_unverified_users():

    cutoff_date = timezone.now() - timedelta(minutes=5)

    unverified_users = User.objects.filter(
        is_active=False, email_verified=False, created_at__lt=cutoff_date
    )

    count = unverified_users.count()
    if count > 0:
        unverified_users.delete()
        logger.info(f"Deleted {count} unverified users")


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(delete_unverified_users, "interval", minutes=2)
    scheduler.start()
    logger.info("Scheduler started: cleaning unverified users every 2 minutes")
