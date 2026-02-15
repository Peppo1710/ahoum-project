from django.urls import path
from .views import MeView, mock_login, oauth_complete

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('mock-login/', mock_login, name='mock_login'),
    path('oauth/complete/', oauth_complete, name='oauth_complete'),
]
