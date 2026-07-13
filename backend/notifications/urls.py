from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, RegisterDeviceTokenView
from django.urls import path

router = DefaultRouter()
router.register('', NotificationViewSet, basename='notification')


urlpatterns = [
    path('register-device/', RegisterDeviceTokenView.as_view(), name='register-device'),
] + router.urls