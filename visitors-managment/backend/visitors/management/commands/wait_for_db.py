"""
Django management command to wait for database availability
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError
import time
import sys

class Command(BaseCommand):
    help = 'Wait for database to become available'

    def add_arguments(self, parser):
        parser.add_argument(
            '--timeout',
            type=int,
            default=60,
            help='Maximum time to wait in seconds (default: 60)'
        )

    def handle(self, *args, **options):
        timeout = options['timeout']
        start_time = time.time()
        
        self.stdout.write("Waiting for database to become available...")
        
        attempt = 1
        while time.time() - start_time < timeout:
            try:
                # Test database connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                
                if result and result[0] == 1:
                    elapsed = time.time() - start_time
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Database available after {elapsed:.1f}s (attempt {attempt})"
                        )
                    )
                    return
                    
            except OperationalError as e:
                elapsed = time.time() - start_time
                remaining = timeout - elapsed
                
                if remaining <= 0:
                    break
                    
                wait_time = min(2 ** (attempt - 1), 10)  # Exponential backoff, max 10s
                wait_time = min(wait_time, remaining)
                
                self.stdout.write(
                    f"Database unavailable (attempt {attempt}, {elapsed:.1f}s elapsed). "
                    f"Retrying in {wait_time:.1f}s..."
                )
                
                time.sleep(wait_time)
                attempt += 1
            
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Unexpected error: {e}")
                )
                sys.exit(1)
        
        # Timeout reached
        self.stdout.write(
            self.style.ERROR(
                f"✗ Database not available after {timeout}s timeout"
            )
        )
        sys.exit(1)
