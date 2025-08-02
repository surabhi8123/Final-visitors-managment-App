from django.db import models
from django.utils import timezone
import uuid


class Visitor(models.Model):
    """Model for storing visitor information."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def total_visits(self):
        return self.visits.count()

    @property
    def last_visit(self):
        return self.visits.order_by('-check_in_time').first()


class Visit(models.Model):
    """Model for storing individual visit records."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='visits')
    purpose = models.TextField()
    host_name = models.CharField(max_length=200, blank=True, help_text="Name of the person being visited")
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-check_in_time']

    def __str__(self):
        return f"{self.visitor.name} - {self.check_in_time.strftime('%Y-%m-%d %H:%M')}"

    def check_out(self):
        """Check out the visitor and calculate duration."""
        if not self.check_out_time:
            self.check_out_time = timezone.now()
            duration = self.check_out_time - self.check_in_time
            self.duration_minutes = int(duration.total_seconds() / 60)
            self.save()
        return self

    @property
    def is_active(self):
        """Check if the visit is currently active (checked in but not checked out)."""
        return self.check_out_time is None

    @property
    def duration_formatted(self):
        """Return formatted duration string."""
        if self.duration_minutes:
            hours = self.duration_minutes // 60
            minutes = self.duration_minutes % 60
            if hours > 0:
                return f"{hours}h {minutes}m"
            return f"{minutes}m"
        return "N/A"

    @property
    def status(self):
        """Return the status of the visit."""
        if self.is_active:
            return "Checked In"
        return "Checked Out"


class VisitorPhoto(models.Model):
    """Model for storing visitor photos."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name='photos')
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='visitor_photos/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Photo of {self.visitor.name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}" 