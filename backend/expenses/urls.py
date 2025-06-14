from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'groups', views.GroupViewSet, basename='group')
router.register(r'expenses', views.ExpenseViewSet, basename='expense')
router.register(r'friends', views.FriendViewSet, basename='friend')
router.register(r'friendrequests', views.FriendRequestsViewSet, basename='friendRequest')

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    path('', include(router.urls)),
]

#path('groups/join/', views.join_group, name='join_group'),