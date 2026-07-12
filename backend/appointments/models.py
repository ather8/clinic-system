from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from patients.models import Patient


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW = 'no_show', 'No show'

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_appointments',
        limit_choices_to={'role': 'doctor'},
    )
    department = models.CharField(max_length=100, blank=True)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.patient} with Dr. {self.doctor} at {self.scheduled_at}"

    def clean(self):
        """Prevent double-booking the same doctor at an overlapping time."""
        if not self.scheduled_at or not self.doctor_id:
            return

        from datetime import timedelta
        start = self.scheduled_at
        end = start + timedelta(minutes=self.duration_minutes)

        overlapping = Appointment.objects.filter(
            doctor=self.doctor,
            status=self.Status.SCHEDULED,
        ).exclude(pk=self.pk)

        for appt in overlapping:
            appt_start = appt.scheduled_at
            appt_end = appt_start + timedelta(minutes=appt.duration_minutes)
            if start < appt_end and appt_start < end:
                raise ValidationError(
                    f"Doctor already has an appointment from {appt_start} to {appt_end}."
                )