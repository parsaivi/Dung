from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import Group, Expense, ExpenseShare, Friend, FriendRequest
from .serializers import GroupSerializer, ExpenseSerializer, UserSerializer, FriendRequestSerializer

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        })
    else:
        return Response({'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not username or not password:
        return Response({'error': 'Username and password required'},
                        status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)},
                        status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Delete the user's token
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    return Response({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name
        }
    })


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return groups where user is a member or creator
        return Group.objects.filter(
            Q(members=self.request.user) |
            Q(created_by=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        # Set the creator as the user making the request
        group = serializer.save(created_by=self.request.user)
        # Automatically add creator as a member
        group.members.add(self.request.user)

    @action(detail=False, methods=['post'])
    def join(self, request, pk=None):
        group_id = request.data.get('group_id')
        user = request.user
        if not group_id:
            return Response({'error': 'Group ID is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'},
                            status=status.HTTP_404_NOT_FOUND)

        if user in group.members.all():
            return Response({'message': 'You are already a member of this group'},
                            status=status.HTTP_400_BAD_REQUEST)

        group.members.add(user)
        return Response({'message': 'Successfully joined the group'})

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        username = request.data.get('username')
        added_by = request.user

        if not username:
            return Response({'error': 'Username is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        if group.created_by != added_by:
            return Response({'error': 'Only the group creator can add members'},
                            status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(username=username)
            group.members.add(user)
            return Response({'status': 'member added'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'},
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def balances(self, request, pk=None):
        """Get balance summary for all members in the group"""
        group = self.get_object()
        balances = []

        for member in group.members.all():
            balance = group.get_member_balance(member)
            balances.append({
                'user': UserSerializer(member).data,
                'balance': str(balance),
                'status': 'owes' if balance < 0 else 'owed' if balance > 0 else 'settled'
            })

        return Response({
            'group': group.name,
            'total_expenses': str(group.get_total_expenses()),
            'balances': balances
        })

    @action(detail=True, methods=['get'])
    def expenses(self, request, pk=None):
        """Get all expenses for this group"""
        group = self.get_object()
        expenses = Expense.objects.filter(group=group).order_by('-date')
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Get detailed information about the group"""
        group = self.get_object()
        serializer = self.get_serializer(group)
        return Response(serializer.data)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.all()
        group_id = self.request.query_params.get('group', None)
        if group_id is not None:
            # Only return expenses for groups the user is a member of
            queryset = queryset.filter(
                group_id=group_id,
                group__members=self.request.user
            )
        else:
            # Return expenses from all groups the user is a member of
            queryset = queryset.filter(group__members=self.request.user)
        return queryset.distinct()

    @action(detail=True, methods=['post'])
    def perform_create(self, serializer):
        # Validate that user is member of the group
        group = serializer.validated_data['group']
        if not group.members.filter(id=self.request.user.id).exists():
            raise serializers.ValidationError("You are not a member of this group")
        amount = serializer.validated_data.get('amount')
        if not amount:
            raise serializers.ValidationError("Amount is required")
        if amount <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")

        print("debuggg")
        # Save expense with current user as payer
        expense = serializer.save(paid_by=self.request.user, group=group, amount=amount)

        # Automatically add all group members as participants
        expense.participants.set(group.members.all())

        # Calculate equal split among all participants
        total_participants = group.members.count()

        if total_participants > 0:
            amount_per_person = expense.amount / total_participants
        else:
            raise serializers.ValidationError("Group must have at least one member")

        # Create ExpenseShare records for each participant
        for member in group.members.all():
            ExpenseShare.objects.create(
                expense=expense,
                user=member,
                amount_owed=amount_per_person
            )

        return expense

class FriendViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        friends_obj = Friend.objects.filter(user=self.request.user)
        friends = [friend.friend for friend in friends_obj]
        return User.objects.filter(id__in=[friend.id for friend in friends])

    @action(detail=False, methods=['post'])
    def add_friend(self, request, pk=None):
        """Add a user as a friend"""
        friend_username = request.data.get('username')
        if not friend_username:
            return Response({'error': 'Username is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            friend = User.objects.get(username=friend_username)
            if friend == request.user:
                return Response({'error': 'You cannot add yourself as a friend'},
                                status=status.HTTP_400_BAD_REQUEST)
            if FriendRequest.objects.filter(from_user=request.user, to_user=friend, accepted=False).exists():
                return Response({'error': 'Friend request already sent'},
                                status=status.HTTP_400_BAD_REQUEST)
            if FriendRequest.objects.filter(from_user=friend, to_user=request.user, accepted=False).exists():
                return Response({'error': 'You have a pending friend request from this user'},
                                status=status.HTTP_400_BAD_REQUEST)
            if Friend.objects.filter(user=request.user, friend=friend).exists():
                return Response({'error': 'This user is already your friend'},
                                status=status.HTTP_400_BAD_REQUEST)
            FriendRequest.objects.create(
                from_user=request.user,
                to_user=friend,
            )
            return Response({'message': 'Friend request sent'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'},
                            status=status.HTTP_404_NOT_FOUND)



class FriendRequestsViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(to_user=self.request.user, accepted=False)

    @action(detail=False, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a friend request"""
        try:
            request_id = request.data.get('id')
            if not request_id:
                return Response({'error': 'Request ID is required'},
                                status=status.HTTP_400_BAD_REQUEST)
            friend_request = FriendRequest.objects.get(id=request_id)
            if friend_request.to_user != request.user:
                return Response({'error': 'You cannot accept this request'},
                                status=status.HTTP_403_FORBIDDEN)
            friend_request.accepted = True
            friend_request.save()
            Friend.objects.create(user=request.user, friend=friend_request.from_user)
            Friend.objects.create(user=friend_request.from_user, friend=request.user)
            return Response({'message': 'Friend request accepted'})
        except FriendRequest.DoesNotExist:
            return Response({'error': 'Friend request not found'},
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a friend request"""
        try:
            request_id = request.data.get('id')
            if not request_id:
                return Response({'error': 'Request ID is required'},
                                status=status.HTTP_400_BAD_REQUEST)
            friend_request = FriendRequest.objects.get(id=request_id)
            if friend_request.to_user != request.user:
                return Response({'error': 'You cannot reject this request'},
                                status=status.HTTP_403_FORBIDDEN)
            friend_request.delete()
            return Response({'message': 'Friend request rejected'})
        except FriendRequest.DoesNotExist:
            return Response({'error': 'Friend request not found'},
                            status=status.HTTP_404_NOT_FOUND)