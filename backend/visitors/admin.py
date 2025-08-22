from django.contrib import admin
from .models import Visitor, Visit, VisitorPhoto


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'created_at', 'total_visits']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ['visitor', 'purpose', 'check_in_time', 'check_out_time', 'duration_formatted', 'is_active']
    list_filter = ['check_in_time', 'check_out_time']
    search_fields = ['visitor__name', 'visitor__email', 'visitor__phone', 'purpose']
    readonly_fields = ['id', 'check_in_time', 'duration_minutes']
    ordering = ['-check_in_time']
    
    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Active'


@admin.register(VisitorPhoto)
class VisitorPhotoAdmin(admin.ModelAdmin):
    list_display = ['visitor', 'visit', 'created_at']
    list_filter = ['created_at']
    search_fields = ['visitor__name', 'visit__purpose']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at'] 