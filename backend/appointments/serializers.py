from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def validate(self, data):
        instance = Appointment(**{**data, 'id': self.instance.id if self.instance else None})
        try:
            instance.clean()
        except Exception as e:
            if hasattr(e, 'message_dict'):
                raise serializers.ValidationError(e.message_dict)
            elif hasattr(e, 'messages'):
                raise serializers.ValidationError(e.messages)
            else:
                raise serializers.ValidationError(str(e))
        return data