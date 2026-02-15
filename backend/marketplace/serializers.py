from rest_framework import serializers
from .models import Session, Booking
from users.serializers import UserSerializer

class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    available_spots = serializers.ReadOnlyField()
    is_booked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = ('id', 'title', 'description', 'date', 'duration', 'capacity', 'price', 'creator', 'available_spots', 'created_at', 'is_booked_by_user')
        read_only_fields = ('creator', 'created_at')

    def get_is_booked_by_user(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.bookings.filter(user=user, status='CONFIRMED').exists()
        return False

class BookingSerializer(serializers.ModelSerializer):
    session_details = SessionSerializer(source='session', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'session', 'session_details', 'status', 'created_at')
        read_only_fields = ('user', 'status', 'created_at')

    def validate_session(self, value):
        if value.available_spots <= 0:
            raise serializers.ValidationError("This session is fully booked.")
        return value
