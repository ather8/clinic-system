from django.contrib import admin
from .models import Invoice, InvoiceLineItem


class InvoiceLineItemInline(admin.TabularInline):
    model = InvoiceLineItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'status', 'issued_at', 'display_total')
    list_filter = ('status',)
    search_fields = ('patient__first_name', 'patient__last_name')
    inlines = [InvoiceLineItemInline]

    def display_total(self, obj):
        return obj.total
    display_total.short_description = 'Total'

    def mark_paid(self):
        if self.status == self.Status.PAID:
            raise ValidationError("Invoice is already paid.")
        if self.status == self.Status.CANCELLED:
            raise ValidationError("Cannot mark a cancelled invoice as paid.")
        self.status = self.Status.PAID
        self.paid_at = timezone.now()
        self.save()