from django.conf import settings
from django.db import models
from patients.models import Patient
from django.utils import timezone
from django.core.exceptions import ValidationError


class Invoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PAID = 'paid', 'Paid'
        CANCELLED = 'cancelled', 'Cancelled'

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='invoices')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    issued_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='invoices_created',
    )

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f"Invoice #{self.id} - {self.patient} ({self.status})"

    @property
    def total(self):
        return sum(item.line_total for item in self.line_items.all())
    
    def mark_paid(self):
        if self.status == self.Status.PAID:
            raise ValidationError("Invoice is already paid.")
        if self.status == self.Status.CANCELLED:
            raise ValidationError("Cannot mark a cancelled invoice as paid.")
        self.status = self.Status.PAID
        self.paid_at = timezone.now()
        self.save()


class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def line_total(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.description} x{self.quantity}"