from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, MyAppointmentsView

router = DefaultRouter()
router.register('', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('me/', MyAppointmentsView.as_view(), name='my-appointments'),
] + router.urls