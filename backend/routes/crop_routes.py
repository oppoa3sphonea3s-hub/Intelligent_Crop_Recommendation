"""
Crop Recommendation API routes.
"""
from flask import Blueprint, request, jsonify
from services.ml_service import predict_crop, get_crop_catalog, get_ml_metrics_summary

crop_bp = Blueprint('crop_bp', __name__)

@crop_bp.route('/predict-crop', methods=['POST'])
def handle_crop_prediction():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Missing JSON request body'}), 400

        required = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
        # Support both 'N' and 'nitrogen' key names
        n = data.get('N', data.get('nitrogen'))
        p = data.get('P', data.get('phosphorus'))
        k = data.get('K', data.get('potassium'))
        temperature = data.get('temperature', data.get('temp'))
        humidity = data.get('humidity')
        ph = data.get('ph', data.get('pH'))
        rainfall = data.get('rainfall', data.get('rain'))
        notes = data.get('notes', '')

        if None in (n, p, k, temperature, humidity, ph, rainfall):
            return jsonify({
                'success': False,
                'error': 'All 7 agricultural parameters (N, P, K, temperature, humidity, ph, rainfall) are required.'
            }), 400

        # Validate numerical ranges
        try:
            n = float(n)
            p = float(p)
            k = float(k)
            temperature = float(temperature)
            humidity = float(humidity)
            ph = float(ph)
            rainfall = float(rainfall)
        except ValueError:
            return jsonify({'success': False, 'error': 'All parameters must be valid numeric values.'}), 400

        if not (0 <= n <= 300):
            return jsonify({'success': False, 'error': 'Nitrogen (N) must be between 0 and 300 kg/ha.'}), 400
        if not (0 <= p <= 300):
            return jsonify({'success': False, 'error': 'Phosphorus (P) must be between 0 and 300 kg/ha.'}), 400
        if not (0 <= k <= 300):
            return jsonify({'success': False, 'error': 'Potassium (K) must be between 0 and 300 kg/ha.'}), 400
        if not (-10 <= temperature <= 60):
            return jsonify({'success': False, 'error': 'Temperature must be between -10°C and 60°C.'}), 400
        if not (0 <= humidity <= 100):
            return jsonify({'success': False, 'error': 'Humidity must be between 0% and 100%.'}), 400
        if not (0 <= ph <= 14):
            return jsonify({'success': False, 'error': 'Soil pH must be between 0 and 14.'}), 400
        if not (0 <= rainfall <= 1000):
            return jsonify({'success': False, 'error': 'Rainfall must be between 0 and 1000 mm.'}), 400

        result = predict_crop(n, p, k, temperature, humidity, ph, rainfall, notes=notes)
        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@crop_bp.route('/crops-catalog', methods=['GET'])
def handle_crop_catalog():
    try:
        catalog = get_crop_catalog()
        return jsonify({'success': True, 'count': len(catalog), 'data': catalog}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@crop_bp.route('/ml-metrics', methods=['GET'])
def handle_ml_metrics():
    try:
        metrics = get_ml_metrics_summary()
        return jsonify({'success': True, 'data': metrics}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
