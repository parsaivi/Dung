from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, Expense, ExpenseShare, FriendRequest


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'created_by', 'members', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'paid_by', 'group', 'participants', 'date', 'description']
        read_only_fields = ['paid_by', 'date']


class ExpenseShareSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ExpenseShare
        fields = ['expense', 'user', 'amount_owed']


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'created_at', 'accepted']
        read_only_fields = ['from_user', 'to_user', 'created_at']