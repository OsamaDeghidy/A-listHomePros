from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import requests


class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    created and modified fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Address(TimeStampedModel):
    """
    Model for storing address information
    """
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='Egypt')
    
    # Geographic coordinates for mapping
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text='Latitude coordinate')
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, help_text='Longitude coordinate')
    
    is_primary = models.BooleanField(default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')

    def __str__(self):
        parts = [self.street_address, self.city, self.state, self.zip_code]
        return ', '.join(filter(None, parts))

    def geocode_address(self):
        """Automatically geocode the address to get coordinates"""
        if not any([self.street_address, self.city, self.state]):
            print("❌ Geocoding failed: No address components provided")
            return False
            
        address_parts = [
            self.street_address,
            self.city,
            self.state,
            self.country
        ]
        address_string = ', '.join(filter(None, address_parts))
        
        print(f"🔍 Attempting to geocode: {address_string}")
        
        try:
            encoded_address = requests.utils.quote(address_string)
            url = f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=1&addressdetails=1&countrycodes=eg'
            
            print(f"🌐 API URL: {url}")
            
            response = requests.get(
                url,
                headers={
                    'User-Agent': 'AListHomePros/1.0',
                    'Accept': 'application/json'
                },
                timeout=15
            )
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📊 Response data: {data}")
                
                if data and len(data) > 0:
                    result = data[0]
                    lat = float(result['lat'])
                    lng = float(result['lon'])
                    
                    print(f"✅ Geocoded successfully: {lat}, {lng}")
                    
                    self.latitude = lat
                    self.longitude = lng
                    return True
                else:
                    print("❌ No geocoding results found")
            else:
                print(f"❌ HTTP Error: {response.status_code} - {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Request error: {e}")
        except Exception as e:
            print(f"❌ Geocoding error: {e}")
        
        return False

    def save(self, *args, **kwargs):
        # Handle empty zip_code - convert empty string to None
        if self.zip_code is not None and self.zip_code.strip() == '':
            self.zip_code = None
            
        # Auto-geocode if coordinates are missing
        if not self.latitude or not self.longitude:
            self.geocode_address()
        
        # Handle primary address logic
        if self.is_primary:
            # Set all other addresses for this user as non-primary
            Address.objects.filter(user=self.user, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        
        super().save(*args, **kwargs)

    def clean(self):
        if not any([self.street_address, self.city, self.state]):
            raise ValidationError('At least one of street address, city, or state must be provided.')

    @property
    def full_address(self):
        """Return formatted full address"""
        parts = [
            self.street_address,
            self.city,
            self.state,
            self.zip_code,
            self.country
        ]
        return ', '.join(filter(None, parts))

    @property
    def coordinates(self):
        """Return coordinates as tuple if available"""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None

    class Meta:
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'
        ordering = ['-created_at']
