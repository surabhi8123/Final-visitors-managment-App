from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def test_connection(request):
    """
    Test endpoint to verify connection between frontend and backend
    """
    return Response({
        'status': 'success',
        'message': 'Backend is reachable!',
        'client_ip': request.META.get('REMOTE_ADDR'),
        'user_agent': request.META.get('HTTP_USER_AGENT'),
        'request_method': request.method,
    })
