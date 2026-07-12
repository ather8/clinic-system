from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'date_of_birth', 'phone_number', 'blood_type')
    list_filter = ('blood_type',)
    search_fields = ('first_name', 'last_name', 'phone_number')