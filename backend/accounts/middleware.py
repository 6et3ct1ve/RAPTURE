import logging
import json
from django.utils.deprecation import MiddlewareMixin
import json

logger = logging.getLogger("accounts")

class AuthLoggingMiddleware(MiddlewareMixin):
    def _decode_username(self, request):
        # there is a wwrong object in middleware that we can't get body from. This one does the job
        try:
            decoded_data = json.loads(request.body.decode('utf-8'))
            return body.get("username", "unknown")
        except:
            return "unknown"

    def process_request(self, request):
        if request.path == "/api/accounts/login/" and request.method == "POST":
            username = self._decode_username(request)
            logger.info(f"Login attempt: {username}")
        return None
    
    def process_response(self, request, response):
        if request.path == "/api/accounts/login/" and request.method == "POST":
            username = self._decode_username(request)
            if response.status_code == 200:
                username = self._decode_username(request)
                logger.info(f"Login successful: {username}")
            elif response.status_code == 401:
                username = self._decode_username(request)
                logger.warning(f"Login failed: {username}")
        return response
