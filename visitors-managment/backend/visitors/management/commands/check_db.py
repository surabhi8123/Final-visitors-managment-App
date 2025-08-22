"""
Django management command to check database connectivity
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError
import sys

class Command(BaseCommand):
    help = 'Check database connectivity and health'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retries',
            type=int,
            default=5,
            help='Number of connection attempts (default: 5)'
        )
        parser.add_argument(
            '--delay',
            type=int,
            default=2,
            help='Delay between retries in seconds (default: 2)'
        )

    def handle(self, *args, **options):
        retries = options['retries']
        delay = options['delay']
        
        self.stdout.write("Checking database connectivity...")
        
        for attempt in range(1, retries + 1):
            try:
                # Test basic connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                
                if result and result[0] == 1:
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Database connection successful on attempt {attempt}")
                    )
                    
                    # Get database info
                    cursor.execute("SELECT version()")
                    db_version = cursor.fetchone()[0]
                    self.stdout.write(f"Database version: {db_version}")
                    
                    # Test table access
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        LIMIT 5
                    """)
                    tables = cursor.fetchall()
                    self.stdout.write(f"Found {len(tables)} tables in database")
                    
                    return
                    
            except OperationalError as e:
                self.stdout.write(
                    self.style.WARNING(f"✗ Attempt {attempt}/{retries} failed: {e}")
                )
                
                if attempt < retries:
                    self.stdout.write(f"Retrying in {delay} seconds...")
                    import time
                    time.sleep(delay)
                else:
                    self.stdout.write(
                        self.style.ERROR("✗ All connection attempts failed")
                    )
                    sys.exit(1)
            
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"✗ Unexpected error: {e}")
                )
                sys.exit(1)
