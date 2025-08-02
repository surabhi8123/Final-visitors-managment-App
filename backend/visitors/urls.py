from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorViewSet, VisitViewSet

router = DefaultRouter()
router.register(r'visitors', VisitorViewSet)
router.register(r'visits', VisitViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 