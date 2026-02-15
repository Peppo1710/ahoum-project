from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Session, Booking
from .serializers import SessionSerializer, BookingSerializer
from users.permissions import IsCreatorOrReadOnly

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all().order_by('date')
    serializer_class = SessionSerializer
    permission_classes = [IsCreatorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def get_queryset(self):
        return Session.objects.all().order_by('date')

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_sessions(self, request):
        if request.user.role != 'CREATOR':
             return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        sessions = Session.objects.filter(creator=request.user).order_by('date')
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'CREATOR':
             # Creators see bookings for their sessions
             return Booking.objects.filter(session__creator=self.request.user)
        # Users see their own bookings
        return Booking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if already booked
        session = serializer.validated_data['session']
        if Booking.objects.filter(user=self.request.user, session=session).exists():
           raise exceptions.ValidationError("You have already booked this session.")
        serializer.save(user=self.request.user)
