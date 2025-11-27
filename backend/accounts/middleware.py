import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("accounts")


class AuthLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path == "/api/accounts/login/" and request.method == "POST":
            username = request.data.get("username", "unknown")
            logger.info(f"Login attempt: {username}")
        return None

    def process_response(self, request, response):
        if request.path == "/api/accounts/login/" and request.method == "POST":
            if response.status_code == 200:
                username = request.data.get("username", "unknown")
                logger.info(f"Login successful: {username}")
            elif response.status_code == 401:
                username = request.data.get("username", "unknown")
                logger.warning(f"Login failed: {username}")
        return response
