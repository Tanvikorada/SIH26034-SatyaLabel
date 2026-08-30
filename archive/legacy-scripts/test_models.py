import os
import time
import requests
import json
import base64

API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    with open('backend/.env', 'r') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                API_KEY = line.strip().split('=')[1]

def test_model(model_name):
    print(f"Testing {model_name}...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    payload = {
        "contents": [{
            "parts": [{"text": "Hello, simply reply with 'OK'"}]
        }]
    }
    headers = {"Content-Type": "application/json"}
    
    start = time.time()
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"[{model_name}] Status: {resp.status_code}")
        print(f"[{model_name}] Response: {resp.text[:100]}")
    except Exception as e:
        print(f"[{model_name}] Error: {str(e)}")
    print(f"Took {time.time()-start:.2f}s\n")

test_model('gemini-3.7-flash')
test_model('gemini-2.5-flash')
test_model('gemini-flash-latest')
test_model('gemini-1.5-flash-latest')
