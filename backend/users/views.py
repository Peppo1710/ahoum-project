from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([AllowAny])
def mock_login(request):
    """Dev-only mock login endpoint. Creates user if not exists and returns JWT."""
    username = request.data.get('username')
    role = request.data.get('role', 'USER')

    if not username:
        return Response({'error': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(username=username)
    if created:
        user.role = role
        user.set_unusable_password()
        user.save()

    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'username': user.username,
    })


def oauth_complete(request):
    """
    Called after social_django completes OAuth.
    This is a plain Django view (NOT a DRF api_view) because social_django
    stores the authenticated user in the Django session, and DRF's
    JWTAuthentication would ignore that session entirely.
    Issues a JWT and redirects the user to the frontend with tokens.
    """
    logger.info(f"OAuth complete called. User: {request.user}, Authenticated: {request.user.is_authenticated}")
    logger.info(f"Session key: {request.session.session_key}")
    
    user = request.user
    if not user or not user.is_authenticated:
        logger.error("User not authenticated after OAuth")
        return redirect('http://localhost/login?error=auth_failed')

    refresh = RefreshToken.for_user(user)

    frontend_url = (
        f"http://localhost/login"
        f"?access={str(refresh.access_token)}"
        f"&refresh={str(refresh)}"
        f"&role={user.role}"
        f"&username={user.username}"
    )
    logger.info(f"OAuth success for {user.username}, redirecting to frontend")
    return redirect(frontend_url)
