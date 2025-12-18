from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.conf import settings


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{timestamp}{user.email_verified}"

    @property
    def timeout(self):
        return getattr(settings, "EMAIL_VERIFICATION_TIMEOUT", 60)


email_verification_token = EmailVerificationTokenGenerator()
