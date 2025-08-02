from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.http import HttpResponse
import csv
from datetime import datetime
from django.conf import settings

from .models import Visitor, Visit, VisitorPhoto
from .serializers import (
    VisitorSerializer, VisitSerializer, CheckInSerializer, CheckOutSerializer,
    VisitHistorySerializer, VisitorPhotoSerializer
)


class VisitorViewSet(viewsets.ModelViewSet):
    """ViewSet for visitor management."""
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['email', 'phone']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at', 'total_visits']

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """Check in a new visitor or existing visitor."""
        serializer = CheckInSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            existing_visitor = data.get('existing_visitor')
            
            # If visitor exists, update their information
            if existing_visitor:
                visitor = existing_visitor
                visitor.name = data['name']
                visitor.email = data['email']
                visitor.phone = data['phone']
                visitor.save()
            else:
                # Create new visitor
                visitor = Visitor.objects.create(
                    name=data['name'],
                    email=data['email'],
                    phone=data['phone']
                )
            
            # Create visit record
            visit = Visit.objects.create(
                visitor=visitor,
                purpose=data['purpose'],
                host_name=data.get('host_name', '')
            )
            
            # Handle photo upload if provided
            photo_file = request.FILES.get('photo')
            if photo_file:
                # Create photo record
                photo = VisitorPhoto.objects.create(
                    visitor=visitor,
                    visit=visit,
                    image=photo_file
                )
                print(f"Photo saved: {photo.image.url}")
                print(f"Photo path: {photo.image.path}")
                print(f"Photo name: {photo.image.name}")
            
            # Return visit details with photos
            visit_serializer = VisitSerializer(visit, context={'request': request})
            return Response({
                'message': 'Visitor checked in successfully',
                'visit': visit_serializer.data,
                'is_returning_visitor': existing_visitor is not None
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        """Check out a visitor."""
        serializer = CheckOutSerializer(data=request.data)
        if serializer.is_valid():
            try:
                visit = Visit.objects.get(id=serializer.validated_data['visit_id'])
                if visit.check_out_time:
                    return Response({
                        'error': 'Visitor has already been checked out'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                visit.check_out()
                visit_serializer = VisitSerializer(visit)
                return Response({
                    'message': 'Visitor checked out successfully',
                    'visit': visit_serializer.data
                }, status=status.HTTP_200_OK)
            except Visit.DoesNotExist:
                return Response({
                    'error': 'Visit not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all currently active visitors."""
        active_visits = Visit.objects.filter(check_out_time__isnull=True)
        serializer = VisitSerializer(active_visits, many=True, context={'request': request})
        return Response({
            'active_visitors': serializer.data,
            'count': active_visits.count()
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get visit history with search and filter options."""
        visits = Visit.objects.all()
        
        # Apply filters
        name = request.query_params.get('name')
        phone = request.query_params.get('phone')
        email = request.query_params.get('email')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if name:
            visits = visits.filter(visitor__name__icontains=name)
        if phone:
            visits = visits.filter(visitor__phone__icontains=phone)
        if email:
            visits = visits.filter(visitor__email__icontains=email)
        if date_from:
            visits = visits.filter(check_in_time__date__gte=date_from)
        if date_to:
            visits = visits.filter(check_in_time__date__lte=date_to)
        
        # Order by check-in time (newest first)
        visits = visits.order_by('-check_in_time')
        
        serializer = VisitHistorySerializer(visits, many=True, context={'request': request})
        return Response({
            'visits': serializer.data,
            'count': visits.count()
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export visit history as CSV."""
        visits = Visit.objects.all().order_by('-check_in_time')
        
        # Apply same filters as history endpoint
        name = request.query_params.get('name')
        phone = request.query_params.get('phone')
        email = request.query_params.get('email')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if name:
            visits = visits.filter(visitor__name__icontains=name)
        if phone:
            visits = visits.filter(visitor__phone__icontains=phone)
        if email:
            visits = visits.filter(visitor__email__icontains=email)
        if date_from:
            visits = visits.filter(check_in_time__date__gte=date_from)
        if date_to:
            visits = visits.filter(check_in_time__date__lte=date_to)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="visit_history_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Visitor Name', 'Email', 'Phone', 'Purpose', 'Host Name', 'Status',
            'Check-in Time', 'Check-out Time', 'Duration (minutes)', 'Duration (formatted)'
        ])
        
        for visit in visits:
            writer.writerow([
                visit.visitor.name,
                visit.visitor.email,
                visit.visitor.phone,
                visit.purpose,
                visit.host_name or 'N/A',
                visit.status,
                visit.check_in_time.strftime('%Y-%m-%d %H:%M:%S'),
                visit.check_out_time.strftime('%Y-%m-%d %H:%M:%S') if visit.check_out_time else 'N/A',
                visit.duration_minutes or 'N/A',
                visit.duration_formatted
            ])
        
        return response

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search for existing visitors by email or phone."""
        email = request.query_params.get('email')
        phone = request.query_params.get('phone')
        
        if not email and not phone:
            return Response({
                'error': 'Please provide email or phone number'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        visitor = None
        if email:
            try:
                visitor = Visitor.objects.get(email=email)
            except Visitor.DoesNotExist:
                pass
        
        if not visitor and phone:
            try:
                visitor = Visitor.objects.get(phone=phone)
            except Visitor.DoesNotExist:
                pass
        
        if visitor:
            serializer = VisitorSerializer(visitor)
            return Response({
                'found': True,
                'visitor': serializer.data
            })
        else:
            return Response({
                'found': False,
                'message': 'No existing visitor found'
            })

    @action(detail=False, methods=['get'])
    def debug_photos(self, request):
        """Debug endpoint to check photo storage and URLs."""
        try:
            # Get all photos
            photos = VisitorPhoto.objects.all().order_by('-created_at')[:5]
            photo_data = []
            
            for photo in photos:
                photo_data.append({
                    'id': str(photo.id),
                    'visitor_name': photo.visitor.name,
                    'visit_id': str(photo.visit.id),
                    'image_name': photo.image.name,
                    'image_url': photo.image.url,
                    'full_url': request.build_absolute_uri(photo.image.url),
                    'created_at': photo.created_at.isoformat(),
                })
            
            return Response({
                'total_photos': VisitorPhoto.objects.count(),
                'recent_photos': photo_data,
                'media_url': settings.MEDIA_URL,
                'media_root': settings.MEDIA_ROOT,
            })
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VisitViewSet(viewsets.ModelViewSet):
    """ViewSet for visit management."""
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['visitor', 'check_in_time', 'check_out_time']
    search_fields = ['visitor__name', 'visitor__email', 'visitor__phone', 'purpose']
    ordering_fields = ['check_in_time', 'check_out_time', 'duration_minutes'] 