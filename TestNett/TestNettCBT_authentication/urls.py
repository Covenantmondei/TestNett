from django.urls import path
from .views import *

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('verify-email/<str:uidb64>/<str:token>/', verify_email, name='verify_email'),
    path('resend-verification/', resend_verification_email, name='resend_verification'),
    path('google/login/', GoogleLogin.as_view(), name='google_login'),
    path('google-config/', google_client_id, name='google_config'),
]