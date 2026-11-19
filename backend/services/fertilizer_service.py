"""
Fertilizer Recommendation Service.
Combines ICAR agronomic deficiency benchmarking and ML classification.
Records history to SQLite database.
"""
import os
import json
import joblib
import pandas as pd
from database.db import get_db_connection
import sys

# Import the agronomic recommendation engine from ml module
ML_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'ml')
)
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from fertilizer_model import analyze_soil_and_recommend, CROP_NUTRIENT_DATABASE, FERTILIZER_SPECS

MODELS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'saved_models')
)

# Load trained fertilizer classifier artifacts if present
try:
    FERT_ARTIFACTS = joblib.load(os.path.join(MODELS_DIR, 'fertilizer_model.joblib'))
except Exception as e:
    print("Fertilizer ML classifier not loaded:", e)
    FERT_ARTIFACTS = None

def recommend_fertilizer(nitrogen, phosphorus, potassium, ph, crop_name, soil_type=None, moisture=None, temperature=None):
    """
    Generate agronomic fertilizer recommendations based on soil N-P-K-pH and target crop.
    Also queries ML classifier when soil/moisture inputs are available.
    Stores query and findings in SQLite database.
    """
    n = float(nitrogen)
    p = float(phosphorus)
    k = float(potassium)
    ph_val = float(ph)
    crop_str = str(crop_name).strip().lower()

    # 1. Run Agronomic Deficiency & Recommendation Engine
    analysis = analyze_soil_and_recommend(n, p, k, ph_val, crop_str)

    # 2. Run ML classifier if applicable
    ml_prediction = None
    if FERT_ARTIFACTS is not None and soil_type:
        try:
            m = FERT_ARTIFACTS['model']
            s_enc = FERT_ARTIFACTS['soil_encoder']
            c_enc = FERT_ARTIFACTS['crop_encoder']
            f_enc = FERT_ARTIFACTS['fertilizer_encoder']

            # Match crop
            matched_crop = None
            for c in c_enc.classes_:
                if c.lower() in crop_str or crop_str in c.lower():
                    matched_crop = c
                    break
            if not matched_crop:
                matched_crop = c_enc.classes_[0]

            matched_soil = soil_type.title() if soil_type.title() in s_enc.classes_ else s_enc.classes_[0]

            s_code = s_enc.transform([matched_soil])[0]
            c_code = c_enc.transform([matched_crop])[0]
            temp_val = float(temperature) if temperature is not None else 28.0
            moist_val = float(moisture) if moisture is not None else 40.0
            humid_val = 60.0

            row = pd.DataFrame([{
                'Temparature': temp_val,
                'Humidity': humid_val,
                'Moisture': moist_val,
                'Soil_Type_Encoded': s_code,
                'Crop_Type_Encoded': c_code,
                'Nitrogen': n,
                'Potassium': k,
                'Phosphorous': p
            }])
            pred_code = m.predict(row)[0]
            ml_fert_name = f_enc.inverse_transform([pred_code])[0]
            ml_prediction = {
                'fertilizer': ml_fert_name,
                'model': 'Random Forest Classifier (Soil & Crop Dataset)',
                'accuracy': FERT_ARTIFACTS.get('accuracy', 1.0)
            }
        except Exception as ex:
            print("ML classifier inference error:", ex)

    # 3. Store in SQLite database
    conn = get_db_connection()
    cursor = conn.cursor()
    ph_action_str = analysis['ph_remediation']['action']
    dosage_str = ", ".join([f"{r['fertilizer']}: {r['dosage_guideline']}" for r in analysis['fertilizer_recommendations']])

    cursor.execute("""
        INSERT INTO fertilizer_recommendations (
            crop_name, nitrogen, phosphorus, potassium, ph,
            nutrient_analysis, recommended_fertilizers, ph_action, dosage_summary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        crop_str, n, p, k, ph_val,
        json.dumps(analysis['soil_analysis']),
        json.dumps(analysis['fertilizer_recommendations']),
        ph_action_str,
        dosage_str
    ))
    rec_id = cursor.lastrowid
    conn.commit()
    conn.close()

    analysis['recommendation_id'] = rec_id
    analysis['ml_prediction'] = ml_prediction
    return analysis
