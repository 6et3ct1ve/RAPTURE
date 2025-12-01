import logging
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("accounts")

class AuthLoggingMiddleware(MiddlewareMixin):
    def _get_username(self, request):
        try:
            body = json.loads(request.body.decode('utf-8'))
            return body.get("username", "unknown")
        except:
            return request.POST.get("username", "unknown")
    
    def process_request(self, request):
        if request.path == "/api/accounts/login/" and request.method == "POST":
            username = self._get_username(request)
            logger.info(f"Login attempt: {username}")
        return None
    
    def process_response(self, request, response):
        if request.path == "/api/accounts/login/" and request.method == "POST":
            username = self._get_username(request)
            if response.status_code == 200:
                logger.info(f"Login successful: {username}")
            elif response.status_code == 401:
                logger.warning(f"Login failed: {username}")
        return response
