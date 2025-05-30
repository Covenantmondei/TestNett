from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import UserModel

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = UserModel
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password', 'is_verified']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_verified': {'read_only': True}
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')  # Remove confirm_password as we don't need it in the model
        user = UserModel.objects.create(
            **validated_data,
            password=make_password(password)
        )
        return user