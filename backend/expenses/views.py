from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Group, Expense
from .serializers import GroupSerializer, ExpenseSerializer, UserSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def perform_create(self, serializer):
        # Set the creator as the user making the request
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            group.members.add(user)
            return Response({'status': 'member added'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'},
                          status=status.HTTP_404_NOT_FOUND)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def perform_create(self, serializer):
        serializer.save(paid_by=self.request.user)