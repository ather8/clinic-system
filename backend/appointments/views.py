from rest_framework import viewsets, generics, permissions
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsStaff
from .models import Appointment
from .serializers import AppointmentSerializer



class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsStaff]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'department', 'doctor', 'patient']


class MyAppointmentsView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # A patient only ever sees appointments tied to their own linked Patient record
        patient_profile = getattr(self.request.user, 'patient_profile', None)
        if not patient_profile:
            return Appointment.objects.none()
        return Appointment.objects.filter(patient=patient_profile)

    def perform_create(self, serializer):
        patient_profile = getattr(self.request.user, 'patient_profile', None)
        if not patient_profile:
            raise serializers.ValidationError('No patient profile linked to this account.')
        serializer.save(patient=patient_profile)