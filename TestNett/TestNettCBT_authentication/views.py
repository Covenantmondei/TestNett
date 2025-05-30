from django.shortcuts import render, redirect
from rest_framework import viewsets, status
from django.contrib.auth import get_user_model
from .models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from .utils import send_verification_email
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
import os, dotenv

dotenv.load_dotenv()


# User = get_user_model()

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:8000/testnett/google/login/callback/"  # Update this in production
    client_class = OAuth2Client
    
    def get_response(self):
        response = super().get_response()
        if response.status_code == 200:
            data = response.data
            # Add any additional user data you want to return
            data['message'] = 'Successfully logged in with Google'
            response.data = data
        return response

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    try:
        data = request.data
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        # Validate required fields
        if not all([username, email, password, confirm_password]):
            return Response(
                {"error": "Username, email, and password are required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate passwords match
        if password != confirm_password:
            return Response(
                {"error": "Passwords do not match"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if UserModel.objects.filter(email=email).exists():
            return Response(
                {"error": "User with this email already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if UserModel.objects.filter(username=username).exists():
            return Response(
                {"error": "Username is already taken"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = UserModel.objects.create(last_name=last_name, first_name=first_name, username=username, email=email, password=make_password(password), is_active=True)

        # Send verification email
        email_sent = send_verification_email(user)
        
        if email_sent:
            return Response(
                {
                    "message": "User created successfully. Please check your email to verify your account.",
                    "user_id": user.id
                }, 
                status=status.HTTP_201_CREATED
            )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {"error": "Something went wrong"}, 
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = UserModel.objects.get(pk=uid)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect('/TestNett_Frontend/html/verify-success.html')
        else:
            return redirect('/TestNett_Frontend/html/verify-failed.html')
            
    except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
        return redirect('/TestNett_Frontend/html/verify-failed.html')

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    try:
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = UserModel.objects.get(email=email)
            
            if user.is_active:
                return Response(
                    {"error": "User is already verified"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Resend verification email
            email_sent = send_verification_email(user)
            
            if email_sent:
                return Response(
                    {"message": "Verification email has been resent. Please check your inbox."}, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Failed to send verification email"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except UserModel.DoesNotExist:
            return Response(
                {"error": "No user found with this email address"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(['GET'])
@permission_classes([AllowAny])
def google_client_id(request):
    return Response({
        'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not password:
            return Response(
                {"error": "Username and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        if UserModel.objects.filter(username=username).exists() or UserModel.objects.filter(email=email).exists():
            if UserModel.oblects.get(password=password):
                return Response(
                    {"message": "Login successful"}, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Invalid username or password"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
    except UserModel.DoesNotExist:
        return Response(
            {"error": "Invalid username or password"}, 
            status=status.HTTP_404_NOT_FOUND
        )