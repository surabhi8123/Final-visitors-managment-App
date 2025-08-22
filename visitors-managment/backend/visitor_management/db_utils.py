"""
Database utility functions for handling connection issues
"""
import time
import logging
from django.db import connection
from django.db.utils import OperationalError

logger = logging.getLogger(__name__)

def wait_for_db(max_retries=30, delay=2):
    """
    Wait for database to become available with exponential backoff
    """
    for attempt in range(max_retries):
        try:
            connection.ensure_connection()
            logger.info("Database connection established successfully")
            return True
        except OperationalError as e:
            if attempt == max_retries - 1:
                logger.error(f"Failed to connect to database after {max_retries} attempts: {e}")
                raise
            
            wait_time = min(delay * (2 ** attempt), 60)  # Cap at 60 seconds
            logger.warning(f"Database unavailable (attempt {attempt + 1}/{max_retries}). Retrying in {wait_time}s...")
            time.sleep(wait_time)
    
    return False

def test_db_connection():
    """
    Test database connection and return status
    """
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return True, "Database connection successful"
    except Exception as e:
        return False, str(e)
