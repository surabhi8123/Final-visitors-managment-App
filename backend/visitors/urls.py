from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorViewSet, VisitViewSet
from .views_test import test_connection

router = DefaultRouter()
router.register(r'visitors', VisitorViewSet)
router.register(r'visits', VisitViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('test-connection/', test_connection, name='test-connection'),
] 