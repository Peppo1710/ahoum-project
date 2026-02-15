from django.contrib import admin
from .models import Session, Booking


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'date', 'duration', 'capacity', 'available_spots', 'created_at')
    list_filter = ('date', 'creator')
    search_fields = ('title', 'description')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username', 'session__title')
