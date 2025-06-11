#!/usr/bin/env python3
"""
Simple geocoding test script (no Django required)
"""

import requests
import urllib.parse

def test_geocoding(address_string):
    """Test geocoding with OpenStreetMap Nominatim"""
    print(f"🔍 Testing geocoding for: {address_string}")
    
    try:
        # Encode the address
        encoded_address = urllib.parse.quote(address_string)
        
        # Try different API variations
        urls = [
            f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=3&addressdetails=1',
            f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=3&addressdetails=1&countrycodes=eg',
            f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=3&addressdetails=1&accept-language=en',
        ]
        
        for i, url in enumerate(urls, 1):
            print(f"\n🌐 Test {i}: Testing URL")
            print(f"   {url}")
            
            response = requests.get(
                url,
                headers={
                    'User-Agent': 'AListHomePros/1.0',
                    'Accept': 'application/json'
                },
                timeout=15
            )
            
            print(f"📡 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    print(f"📊 Found {len(data)} results:")
                    for j, result in enumerate(data, 1):
                        lat = result['lat']
                        lng = result['lon']
                        display_name = result.get('display_name', 'Unknown')
                        print(f"   {j}. 📍 {lat}, {lng}")
                        print(f"      🏠 {display_name}")
                else:
                    print("❌ No results found")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    # Test with different address formats
    test_addresses = [
        "الإسكندرية، مصر",
        "Alexandria, Egypt", 
        "شارع الجمهورية، الإسكندرية، مصر",
        "Tahrir Square, Cairo, Egypt",
        "ميدان التحرير، القاهرة، مصر",
        "45, 21539 الصقرية، الإسكندرية",
        "New Capital, Egypt"
    ]
    
    for address in test_addresses:
        test_geocoding(address)
        print("="*80)
        
    print("\n✅ Geocoding test completed!") 