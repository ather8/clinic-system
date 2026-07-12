from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, MyPatientProfileView

router = DefaultRouter()
router.register('', PatientViewSet, basename='patient')

urlpatterns = [
    path('me/', MyPatientProfileView.as_view(), name='my-patient-profile'),
] + router.urls