"""
Flask Backend Application for Intelligent Crop and Fertilizer Recommendation System.
"""
import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Add backend directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from database.db import init_db
from routes.crop_routes import crop_bp
from routes.fertilizer_routes import fertilizer_bp
from routes.history_routes import history_bp
from routes.analytics_routes import analytics_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize SQLite database
    init_db()

    # Register Blueprints under /api prefix
    app.register_blueprint(crop_bp, url_prefix='/api')
    app.register_blueprint(fertilizer_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'system': 'Intelligent Crop and Fertilizer Recommendation System',
            'version': '1.0.0',
            'database': 'SQLite connected',
            'endpoints': [
                'POST /api/predict-crop',
                'POST /api/recommend-fertilizer',
                'GET  /api/history',
                'GET  /api/analytics',
                'GET  /api/crops-catalog',
                'GET  /api/ml-metrics',
                'GET  /api/health'
            ]
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting AgriSmart AI Flask Server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
