from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.authtoken.models import Token

def send_verification_email(user):
    # Generate verification token
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Create auth token for API access
    auth_token, created = Token.objects.get_or_create(user=user)
    
    domain = "localhost:8000"  # Change this to your domain in production
    verification_url = f"http://{domain}/testnett/verify-email/{uid}/{token}/"

    subject = 'Verify Your Email - UniCBT'
    message = f'''Hi {user.username},

Thank you for registering with UniCBT. Please verify your email address by clicking the link below:

{verification_url}

If you didn't register for UniCBT, please ignore this email.

Best regards,
UniCBT Team'''

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    try:
        send_mail(
            subject, 
            message, 
            from_email, 
            recipient_list, 
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False


