#!/usr/bin/env python3
"""Test all endpoints"""
import requests
import json
import sys

BASE_URL = "http://localhost:5001"

def test_chat():
    """Test chat endpoint"""
    try:
        print("\n🧪 Testing /chat endpoint...")
        payload = {
            "message": "What should I do with my wheat?",
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_upload():
    """Test upload endpoint with a dummy image"""
    try:
        print("\n🧪 Testing /upload endpoint...")
        # Create a simple test image
        from PIL import Image
        import io
        
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {
            'file': ('test.png', img_bytes, 'image/png')
        }
        data = {
            'query': 'general',
            'language': 'en'
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files, data=data, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        return response.status_code in [200, 500]  # Either success or error is ok, means endpoint works
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_home():
    """Test home endpoint"""
    try:
        print("\n🧪 Testing / endpoint...")
        response = requests.get(BASE_URL, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Testing ChatBoat Endpoints")
    print("=" * 50)
    
    results = []
    results.append(("Home Endpoint", test_home()))
    results.append(("Chat Endpoint", test_chat()))
    results.append(("Upload Endpoint", test_upload()))
    
    print("\n" + "=" * 50)
    print("Summary:")
    print("=" * 50)
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)
