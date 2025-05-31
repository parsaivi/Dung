from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, Expense, ExpenseShare

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class GroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'