from rest_framework import serializers
from .models import Visitor, Visit, VisitorPhoto
import base64
from django.core.files.base import ContentFile
from django.conf import settings


class VisitorPhotoSerializer(serializers.ModelSerializer):
    """Serializer for visitor photos."""
    image_data = serializers.CharField(write_only=True, required=False)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VisitorPhoto
        fields = ['id', 'image', 'image_url', 'image_data', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        """Get the full URL for the image."""
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def create(self, validated_data):
        image_data = validated_data.pop('image_data', None)
        if image_data:
            # Handle base64 image data
            try:
                format, imgstr = image_data.split(';base64,')
                ext = format.split('/')[-1]
                image_name = f"visitor_photo_{validated_data['visit'].id}.{ext}"
                validated_data['image'] = ContentFile(base64.b64decode(imgstr), name=image_name)
            except Exception as e:
                raise serializers.ValidationError("Invalid image data format")
        
        return super().create(validated_data)


class VisitSerializer(serializers.ModelSerializer):
    """Serializer for visit records."""
    visitor_name = serializers.CharField(source='visitor.name', read_only=True)
    visitor_email = serializers.CharField(source='visitor.email', read_only=True)
    visitor_phone = serializers.CharField(source='visitor.phone', read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    status = serializers.CharField(read_only=True)
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            'id', 'visitor', 'visitor_name', 'visitor_email', 'visitor_phone',
            'purpose', 'host_name', 'check_in_time', 'check_out_time', 'duration_minutes',
            'duration_formatted', 'is_active', 'status', 'photos'
        ]
        read_only_fields = ['id', 'check_in_time', 'check_out_time', 'duration_minutes']

    def get_photos(self, obj):
        """Get photos with proper context."""
        photos = obj.photos.all()
        return VisitorPhotoSerializer(photos, many=True, context=self.context).data


class VisitorSerializer(serializers.ModelSerializer):
    """Serializer for visitor information."""
    total_visits = serializers.IntegerField(read_only=True)
    last_visit = serializers.SerializerMethodField()
    active_visit = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = [
            'id', 'name', 'email', 'phone', 'created_at', 'updated_at',
            'total_visits', 'last_visit', 'active_visit'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_visit(self, obj):
        """Get the last visit datetime for this visitor."""
        last_visit = obj.visits.order_by('-check_in_time').first()
        if last_visit:
            return last_visit.check_in_time
        return None

    def get_active_visit(self, obj):
        """Get the active visit for this visitor."""
        active_visit = obj.visits.filter(check_out_time__isnull=True).first()
        if active_visit:
            return VisitSerializer(active_visit, context=self.context).data
        return None


class CheckInSerializer(serializers.Serializer):
    """Serializer for visitor check-in."""
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    purpose = serializers.CharField()
    host_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    photo_data = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """Validate check-in data and check for existing visitor."""
        email = data.get('email')
        phone = data.get('phone')
        
        # Check if visitor exists by email or phone
        existing_visitor = None
        if email:
            try:
                existing_visitor = Visitor.objects.get(email=email)
            except Visitor.DoesNotExist:
                pass
        
        if not existing_visitor and phone:
            try:
                existing_visitor = Visitor.objects.get(phone=phone)
            except Visitor.DoesNotExist:
                pass
        
        data['existing_visitor'] = existing_visitor
        return data


class CheckOutSerializer(serializers.Serializer):
    """Serializer for visitor check-out."""
    visit_id = serializers.UUIDField()


class VisitHistorySerializer(serializers.ModelSerializer):
    """Serializer for visit history with visitor details."""
    visitor_name = serializers.CharField(source='visitor.name', read_only=True)
    visitor_email = serializers.CharField(source='visitor.email', read_only=True)
    visitor_phone = serializers.CharField(source='visitor.phone', read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    status = serializers.CharField(read_only=True)
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            'id', 'visitor_name', 'visitor_email', 'visitor_phone',
            'purpose', 'host_name', 'check_in_time', 'check_out_time', 'duration_formatted', 'is_active', 'status', 'photos'
        ]

    def get_photos(self, obj):
        """Get photos with proper context."""
        photos = obj.photos.all()
        return VisitorPhotoSerializer(photos, many=True, context=self.context).data 