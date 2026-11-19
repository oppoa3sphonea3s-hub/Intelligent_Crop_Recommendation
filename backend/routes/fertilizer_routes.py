"""
Fertilizer Recommendation API routes.
"""
from flask import Blueprint, request, jsonify
from services.fertilizer_service import recommend_fertilizer

fertilizer_bp = Blueprint('fertilizer_bp', __name__)

@fertilizer_bp.route('/recommend-fertilizer', methods=['POST'])
def handle_fertilizer_recommendation():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Missing JSON request body'}), 400

        n = data.get('N', data.get('nitrogen'))
        p = data.get('P', data.get('phosphorus'))
        k = data.get('K', data.get('potassium'))
        ph = data.get('ph', data.get('pH'))
        crop = data.get('crop', data.get('crop_name'))
        soil_type = data.get('soil_type', data.get('soilType'))
        moisture = data.get('moisture')
        temperature = data.get('temperature')

        if None in (n, p, k, ph) or not crop:
            return jsonify({
                'success': False,
                'error': 'Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, and Selected Crop are required.'
            }), 400

        try:
            n = float(n)
            p = float(p)
            k = float(k)
            ph = float(ph)
        except ValueError:
            return jsonify({'success': False, 'error': 'N, P, K, and pH must be valid numbers.'}), 400

        if not (0 <= n <= 300 and 0 <= p <= 300 and 0 <= k <= 300 and 0 <= ph <= 14):
            return jsonify({'success': False, 'error': 'Nutrient or pH values out of realistic agronomic bounds.'}), 400

        result = recommend_fertilizer(
            n, p, k, ph, crop,
            soil_type=soil_type,
            moisture=moisture,
            temperature=temperature
        )

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
