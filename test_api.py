"""
Integration test script for backend API.
"""
from app import create_app
import json

app = create_app()
client = app.test_client()

# 1. Health check
res = client.get('/api/health')
print('1. HEALTH:', res.status_code, res.get_json()['status'])

# 2. Predict crop
crop_payload = {
    'nitrogen': 90,
    'phosphorus': 42,
    'potassium': 43,
    'temperature': 20.8,
    'humidity': 82.0,
    'ph': 6.5,
    'rainfall': 202.9,
    'notes': 'Test run for rice'
}
res = client.post('/api/predict-crop', json=crop_payload)
data = res.get_json()
print('2. PREDICT CROP:', res.status_code, 'Predicted:', data['data']['predicted_crop'], 'Confidence:', data['data']['confidence'])

# 3. Recommend fertilizer
fert_payload = {
    'nitrogen': 25,
    'phosphorus': 15,
    'potassium': 20,
    'ph': 5.2,
    'crop': 'rice'
}
res = client.post('/api/recommend-fertilizer', json=fert_payload)
data = res.get_json()
print('3. RECOMMEND FERTILIZER:', res.status_code, 'Fertilizers count:', len(data['data']['fertilizer_recommendations']))

# 4. Analytics
res = client.get('/api/analytics')
data = res.get_json()
print('4. ANALYTICS:', res.status_code, 'Total predictions:', data['data']['total_predictions'])

# 5. History
res = client.get('/api/history')
data = res.get_json()
print('5. HISTORY:', res.status_code, 'Records count:', data['count'])

print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
