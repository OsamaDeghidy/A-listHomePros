from django.core.management.base import BaseCommand
from core.models import Address
import requests


class Command(BaseCommand):
    help = 'Test geocoding functionality'

    def add_arguments(self, parser):
        parser.add_argument('--address', type=str, help='Address to geocode', default='شارع الجمهورية، الإسكندرية، مصر')
        parser.add_argument('--id', type=int, help='Address ID to geocode')

    def handle(self, *args, **options):
        if options['id']:
            try:
                address = Address.objects.get(id=options['id'])
                self.stdout.write(f"🔍 Testing geocoding for address ID {address.id}")
                self.stdout.write(f"📍 Current address: {address}")
                
                if address.geocode_address():
                    address.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Successfully geocoded: {address.latitude}, {address.longitude}')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR('❌ Geocoding failed')
                    )
            except Address.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Address with ID {options["id"]} not found')
                )
        else:
            # Test with manual address
            test_address = options['address']
            self.stdout.write(f"🔍 Testing geocoding with: {test_address}")
            
            # Direct API test
            self.test_direct_api(test_address)

    def test_direct_api(self, address_string):
        """Test the Nominatim API directly"""
        try:
            encoded_address = requests.utils.quote(address_string)
            
            # Test multiple URL variations
            urls = [
                f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=3&addressdetails=1',
                f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=3&addressdetails=1&countrycodes=eg',
                f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=3&addressdetails=1&accept-language=en'
            ]
            
            for i, url in enumerate(urls, 1):
                self.stdout.write(f"\n🌐 Test {i}: {url}")
                
                response = requests.get(
                    url,
                    headers={
                        'User-Agent': 'AListHomePros/1.0',
                        'Accept': 'application/json'
                    },
                    timeout=15
                )
                
                self.stdout.write(f"📡 Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        self.stdout.write(f"📊 Found {len(data)} results:")
                        for result in data:
                            lat, lng = result['lat'], result['lon']
                            display_name = result.get('display_name', 'Unknown')
                            self.stdout.write(f"  📍 {lat}, {lng} - {display_name}")
                    else:
                        self.stdout.write("❌ No results found")
                else:
                    self.stdout.write(f"❌ Error: {response.text}")
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ API Test failed: {str(e)}')
            ) 