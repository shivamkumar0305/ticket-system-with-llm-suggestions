from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description cannot be blank.")
        return value

    def validate_category(self, value):
        valid = [c[0] for c in Ticket.CATEGORY_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Must be one of: {valid}")
        return value

    def validate_priority(self, value):
        valid = [p[0] for p in Ticket.PRIORITY_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Must be one of: {valid}")
        return value