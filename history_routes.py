"""
History API routes for crop and fertilizer predictions.
"""
from flask import Blueprint, request, jsonify
import json
from database.db import get_db_connection

history_bp = Blueprint('history_bp', __name__)

@history_bp.route('/history', methods=['GET'])
def get_prediction_history():
    try:
        category = request.args.get('type', 'crop') # 'crop' or 'fertilizer'
        search = request.args.get('search', '').strip().lower()
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))

        conn = get_db_connection()
        cursor = conn.cursor()

        if category == 'fertilizer':
            query = "SELECT * FROM fertilizer_recommendations"
            params = []
            if search:
                query += " WHERE LOWER(crop_name) LIKE ? OR LOWER(recommended_fertilizers) LIKE ?"
                params.extend([f"%{search}%", f"%{search}%"])
            query += " ORDER BY id DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            cursor.execute(query, params)
            rows = cursor.fetchall()

            results = []
            for r in rows:
                results.append({
                    'id': r['id'],
                    'created_at': r['created_at'],
                    'crop_name': r['crop_name'].title(),
                    'nitrogen': r['nitrogen'],
                    'phosphorus': r['phosphorus'],
                    'potassium': r['potassium'],
                    'ph': r['ph'],
                    'nutrient_analysis': json.loads(r['nutrient_analysis']) if r['nutrient_analysis'] else {},
                    'recommended_fertilizers': json.loads(r['recommended_fertilizers']) if r['recommended_fertilizers'] else [],
                    'ph_action': r['ph_action'],
                    'dosage_summary': r['dosage_summary']
                })
        else:
            # Crop prediction history
            query = "SELECT * FROM crop_predictions"
            params = []
            if search:
                query += " WHERE LOWER(predicted_crop) LIKE ? OR LOWER(model_used) LIKE ? OR LOWER(notes) LIKE ?"
                params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
            query += " ORDER BY id DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            cursor.execute(query, params)
            rows = cursor.fetchall()

            results = []
            for r in rows:
                results.append({
                    'id': r['id'],
                    'created_at': r['created_at'],
                    'nitrogen': r['nitrogen'],
                    'phosphorus': r['phosphorus'],
                    'potassium': r['potassium'],
                    'temperature': r['temperature'],
                    'humidity': r['humidity'],
                    'ph': r['ph'],
                    'rainfall': r['rainfall'],
                    'predicted_crop': r['predicted_crop'].title(),
                    'confidence': r['confidence'],
                    'model_used': r['model_used'],
                    'top_alternatives': json.loads(r['top_alternatives']) if r['top_alternatives'] else [],
                    'notes': r['notes']
                })

        conn.close()
        return jsonify({
            'success': True,
            'count': len(results),
            'type': category,
            'data': results
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@history_bp.route('/history/crop/<int:record_id>', methods=['DELETE'])
def delete_crop_history(record_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM crop_predictions WHERE id = ?", (record_id,))
        deleted = cursor.rowcount
        conn.commit()
        conn.close()

        if deleted == 0:
            return jsonify({'success': False, 'error': 'Record not found'}), 404
        return jsonify({'success': True, 'message': f'Record {record_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@history_bp.route('/history/fertilizer/<int:record_id>', methods=['DELETE'])
def delete_fertilizer_history(record_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM fertilizer_recommendations WHERE id = ?", (record_id,))
        deleted = cursor.rowcount
        conn.commit()
        conn.close()

        if deleted == 0:
            return jsonify({'success': False, 'error': 'Record not found'}), 404
        return jsonify({'success': True, 'message': f'Record {record_id} deleted successfully'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
