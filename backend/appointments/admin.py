from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'scheduled_at', 'duration_minutes', 'status', 'department')
    list_filter = ('status', 'department')
    search_fields = ('patient__first_name', 'patient__last_name', 'doctor__username')
    date_hierarchy = 'scheduled_at'