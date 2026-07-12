from rest_framework import serializers
from .models import Invoice, InvoiceLineItem


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceLineItem
        fields = ('id', 'description', 'quantity', 'unit_price', 'line_total')


class InvoiceSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = (
            'id', 'patient', 'status', 'issued_at', 'paid_at',
            'notes', 'created_by', 'line_items', 'total',
        )
        read_only_fields = ('issued_at', 'paid_at', 'created_by')

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        request = self.context.get('request')
        validated_data['created_by'] = request.user if request else None
        invoice = Invoice.objects.create(**validated_data)
        for item_data in line_items_data:
            InvoiceLineItem.objects.create(invoice=invoice, **item_data)
        return invoice