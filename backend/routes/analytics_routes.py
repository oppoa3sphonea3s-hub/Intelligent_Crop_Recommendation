"""
Analytics API routes for dashboard metrics and visualizations.
Calculates dynamic statistics directly from SQLite database.
"""
from flask import Blueprint, jsonify
from database.db import get_db_connection
from services.ml_service import get_ml_metrics_summary

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
def get_dashboard_analytics():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Prediction Counts
        cursor.execute("SELECT COUNT(*) as count FROM crop_predictions")
        total_crops = cursor.fetchone()['count']

        cursor.execute("SELECT COUNT(*) as count FROM fertilizer_recommendations")
        total_fert = cursor.fetchone()['count']

        # 2. Most recommended crop
        cursor.execute("""
            SELECT predicted_crop, COUNT(*) as frequency
            FROM crop_predictions
            GROUP BY predicted_crop
            ORDER BY frequency DESC
            LIMIT 1
        """)
        top_crop_row = cursor.fetchone()
        most_recommended_crop = {
            'crop': top_crop_row['predicted_crop'].title() if top_crop_row else 'None',
            'count': top_crop_row['frequency'] if top_crop_row else 0
        }

        # 3. Crop Distribution Breakdown (for Pie and Bar charts)
        cursor.execute("""
            SELECT predicted_crop, COUNT(*) as count
            FROM crop_predictions
            GROUP BY predicted_crop
            ORDER BY count DESC
            LIMIT 8
        """)
        crop_dist_rows = cursor.fetchall()
        crop_distribution = [
            {'crop': r['predicted_crop'].title(), 'count': r['count']}
            for r in crop_dist_rows
        ]

        # 4. Average Soil Parameters from User Inquiries
        cursor.execute("""
            SELECT 
                AVG(nitrogen) as avg_n,
                AVG(phosphorus) as avg_p,
                AVG(potassium) as avg_k,
                AVG(temperature) as avg_temp,
                AVG(humidity) as avg_humidity,
                AVG(ph) as avg_ph,
                AVG(rainfall) as avg_rainfall
            FROM crop_predictions
        """)
        avg_row = cursor.fetchone()
        avg_parameters = {
            'nitrogen': round(avg_row['avg_n'] or 0.0, 1),
            'phosphorus': round(avg_row['avg_p'] or 0.0, 1),
            'potassium': round(avg_row['avg_k'] or 0.0, 1),
            'temperature': round(avg_row['avg_temp'] or 0.0, 1),
            'humidity': round(avg_row['avg_humidity'] or 0.0, 1),
            'ph': round(avg_row['avg_ph'] or 0.0, 2),
            'rainfall': round(avg_row['avg_rainfall'] or 0.0, 1)
        }

        # 5. Recent 5 Predictions
        cursor.execute("""
            SELECT id, created_at, predicted_crop, confidence, nitrogen, phosphorus, potassium, ph, rainfall
            FROM crop_predictions
            ORDER BY id DESC
            LIMIT 5
        """)
        recent_rows = cursor.fetchall()
        recent_predictions = [
            {
                'id': r['id'],
                'date': r['created_at'],
                'crop': r['predicted_crop'].title(),
                'confidence': r['confidence'],
                'n': r['nitrogen'],
                'p': r['phosphorus'],
                'k': r['potassium'],
                'ph': r['ph'],
                'rainfall': r['rainfall']
            }
            for r in recent_rows
        ]

        # 6. ML Performance comparison metrics
        ml_metrics = get_ml_metrics_summary()

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'total_predictions': total_crops,
                'total_fertilizer_queries': total_fert,
                'most_frequent_crop': most_recommended_crop,
                'crop_distribution': crop_distribution,
                'average_soil_parameters': avg_parameters,
                'recent_predictions': recent_predictions,
                'ml_performance': ml_metrics.get('comparison', {}),
                'feature_importances': ml_metrics.get('best_model', {}).get('feature_importances', {}),
                'best_model_name': ml_metrics.get('best_model', {}).get('name', 'Random Forest Classifier'),
                'best_model_accuracy': ml_metrics.get('best_model', {}).get('test_accuracy', 0.9955)
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
