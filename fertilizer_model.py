"""
Fertilizer Recommendation Module.
Implements:
1. Machine learning classifier (Random Forest) trained on Fertilizer Prediction dataset.
2. Agronomic Nutrient Deficiency & Fertilizer Engine based on ICAR/Agricultural Reference benchmarks
   (matching standard crop N-P-K-pH requirements).
"""
import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

from preprocessing import load_fertilizer_prediction_data, load_crop_nutrient_requirements

# Standard agronomic reference table for 22 crops (N, P, K in kg/ha, pH range, moisture %)
CROP_NUTRIENT_DATABASE = {
    'rice': {'N': 80, 'P': 40, 'K': 40, 'pH_min': 5.5, 'pH_max': 7.2, 'season': 'Kharif', 'water': 'High (1000-1500 mm)'},
    'maize': {'N': 80, 'P': 40, 'K': 20, 'pH_min': 5.5, 'pH_max': 7.5, 'season': 'Kharif / Rabi', 'water': 'Medium (500-800 mm)'},
    'chickpea': {'N': 40, 'P': 60, 'K': 80, 'pH_min': 5.5, 'pH_max': 7.5, 'season': 'Rabi', 'water': 'Low (300-450 mm)'},
    'kidneybeans': {'N': 20, 'P': 60, 'K': 20, 'pH_min': 5.5, 'pH_max': 6.8, 'season': 'Kharif', 'water': 'Medium (450-600 mm)'},
    'pigeonpeas': {'N': 20, 'P': 60, 'K': 20, 'pH_min': 5.5, 'pH_max': 7.5, 'season': 'Kharif', 'water': 'Low-Medium (500-700 mm)'},
    'mothbeans': {'N': 20, 'P': 40, 'K': 20, 'pH_min': 5.5, 'pH_max': 7.5, 'season': 'Kharif', 'water': 'Low (250-400 mm)'},
    'mungbean': {'N': 20, 'P': 40, 'K': 20, 'pH_min': 5.5, 'pH_max': 7.2, 'season': 'Kharif / Summer', 'water': 'Low (300-450 mm)'},
    'blackgram': {'N': 40, 'P': 60, 'K': 20, 'pH_min': 5.0, 'pH_max': 7.5, 'season': 'Kharif', 'water': 'Medium (400-600 mm)'},
    'lentil': {'N': 20, 'P': 60, 'K': 20, 'pH_min': 5.5, 'pH_max': 7.0, 'season': 'Rabi', 'water': 'Low (300-400 mm)'},
    'pomegranate': {'N': 20, 'P': 10, 'K': 40, 'pH_min': 5.5, 'pH_max': 7.5, 'season': 'Perennial', 'water': 'Medium (500-700 mm)'},
    'banana': {'N': 100, 'P': 75, 'K': 50, 'pH_min': 6.0, 'pH_max': 7.5, 'season': 'Year-round', 'water': 'High (1200-1800 mm)'},
    'mango': {'N': 20, 'P': 20, 'K': 30, 'pH_min': 5.0, 'pH_max': 7.0, 'season': 'Perennial', 'water': 'Medium (600-900 mm)'},
    'grapes': {'N': 20, 'P': 125, 'K': 200, 'pH_min': 5.0, 'pH_max': 7.0, 'season': 'Perennial', 'water': 'Medium (600-800 mm)'},
    'watermelon': {'N': 100, 'P': 10, 'K': 50, 'pH_min': 5.5, 'pH_max': 7.0, 'season': 'Zaid / Summer', 'water': 'Medium (400-600 mm)'},
    'muskmelon': {'N': 100, 'P': 10, 'K': 50, 'pH_min': 5.5, 'pH_max': 7.0, 'season': 'Zaid / Summer', 'water': 'Medium (400-600 mm)'},
    'apple': {'N': 20, 'P': 125, 'K': 200, 'pH_min': 5.5, 'pH_max': 6.8, 'season': 'Perennial (Temperate)', 'water': 'High (800-1100 mm)'},
    'orange': {'N': 20, 'P': 10, 'K': 10, 'pH_min': 5.5, 'pH_max': 7.5, 'season': 'Perennial', 'water': 'Medium (700-1000 mm)'},
    'papaya': {'N': 50, 'P': 50, 'K': 50, 'pH_min': 6.0, 'pH_max': 7.2, 'season': 'Year-round', 'water': 'High (1000-1300 mm)'},
    'coconut': {'N': 20, 'P': 10, 'K': 30, 'pH_min': 5.0, 'pH_max': 8.0, 'season': 'Perennial', 'water': 'High (1300-2000 mm)'},
    'cotton': {'N': 120, 'P': 40, 'K': 20, 'pH_min': 5.8, 'pH_max': 8.0, 'season': 'Kharif', 'water': 'Medium (600-900 mm)'},
    'jute': {'N': 80, 'P': 40, 'K': 40, 'pH_min': 5.5, 'pH_max': 7.0, 'season': 'Kharif', 'water': 'High (1200-1600 mm)'},
    'coffee': {'N': 100, 'P': 20, 'K': 30, 'pH_min': 5.0, 'pH_max': 6.5, 'season': 'Perennial', 'water': 'High (1400-2000 mm)'},
    'sugarcane': {'N': 150, 'P': 60, 'K': 60, 'pH_min': 6.0, 'pH_max': 7.5, 'season': 'Annual', 'water': 'High (1500-2500 mm)'},
    'wheat': {'N': 100, 'P': 50, 'K': 40, 'pH_min': 6.0, 'pH_max': 7.5, 'season': 'Rabi', 'water': 'Medium (450-650 mm)'}
}

FERTILIZER_SPECS = {
    'Urea': {
        'nutrients': '46% Nitrogen (46-0-0)',
        'description': 'Highly concentrated solid nitrogenous fertilizer. Rapidly hydrolyzed into ammoniacal and nitrate forms, promoting vigorous vegetative growth, tillering, and dark green foliage.',
        'application_method': 'Split into 2-3 doses: 1/3 as basal starter, and 2/3 top-dressed at tillering/active vegetative growth. Avoid broadcasting on wet foliage.'
    },
    'DAP': {
        'nutrients': '18% Nitrogen, 46% Phosphorus (18-46-0)',
        'description': 'Diammonium Phosphate provides readily available water-soluble phosphate alongside starter ammoniacal nitrogen, crucial for root proliferation and early seedling vigor.',
        'application_method': 'Best applied as basal dressing placed 3-5 cm below and to the side of seeds at planting.'
    },
    'MOP': {
        'nutrients': '60% Potash (0-0-60)',
        'description': 'Muriate of Potash (Potassium Chloride) delivers high potassium to regulate plant stomata, enhance drought resistance, activate enzymatic pathways, and improve grain filling/fruit quality.',
        'application_method': 'Apply as basal dressing at sowing or in 2 splits for long-duration crops. Avoid in highly saline soils or for chloride-sensitive crops (use SOP instead).'
    },
    'SSP': {
        'nutrients': '16% P2O5, 11% Sulfur, 19% Calcium',
        'description': 'Single Super Phosphate delivers phosphorus along with vital secondary nutrients (sulfur and calcium), making it superior for legumes, oilseeds, and sulfur-deficient soils.',
        'application_method': 'Apply as basal dose incorporated thoroughly into the topsoil prior to sowing.'
    },
    '10-26-26': {
        'nutrients': '10% Nitrogen, 26% Phosphorus, 26% Potassium',
        'description': 'High-potash and phosphate complex fertilizer designed for crops requiring substantial root development and fruit/grain filling without excess nitrogen.',
        'application_method': 'Apply as basal fertilizer at the time of sowing or transplanting.'
    },
    '14-35-14': {
        'nutrients': '14% Nitrogen, 35% Phosphorus, 14% Potassium',
        'description': 'Phosphorus-dominant complex fertilizer designed for initial root establishment and tillering in cereals and oilseeds.',
        'application_method': 'Apply uniformly as basal dose at seed bed preparation.'
    },
    '20-20-0': {
        'nutrients': '20% Nitrogen, 20% Phosphorus, 13% Sulfur (Ammonium Phosphate Sulfate)',
        'description': 'Balanced nitrogen and phosphorus source with sulfur, excellent for oilseeds, pulses, and cereals in light to medium soils.',
        'application_method': 'Apply half at planting (basal) and half during first weeding/irrigation.'
    },
    '17-17-17': {
        'nutrients': '17% Nitrogen, 17% Phosphorus, 17% Potassium',
        'description': 'Equally balanced NPK complete fertilizer suitable for general maintenance, orchards, vegetables, and balanced vegetative/reproductive growth.',
        'application_method': 'Apply in divided doses during vegetative development and flowering.'
    }
}

def train_fertilizer_classifier(save_dir=None):
    """
    Train a classification model on the fertilizer prediction dataset.
    """
    if save_dir is None:
        save_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', 'saved_models')
        )
    os.makedirs(save_dir, exist_ok=True)

    df = load_fertilizer_prediction_data()
    print("=" * 60)
    print(f"Training Fertilizer Classifier on dataset of {len(df)} samples")
    print("=" * 60)

    # Encode categorical features
    soil_encoder = LabelEncoder()
    crop_encoder = LabelEncoder()
    fertilizer_encoder = LabelEncoder()

    df['Soil_Type_Encoded'] = soil_encoder.fit_transform(df['Soil Type'])
    df['Crop_Type_Encoded'] = crop_encoder.fit_transform(df['Crop Type'])
    df['Fertilizer_Encoded'] = fertilizer_encoder.fit_transform(df['Fertilizer Name'])

    features = ['Temparature', 'Humidity', 'Moisture', 'Soil_Type_Encoded', 'Crop_Type_Encoded', 'Nitrogen', 'Potassium', 'Phosphorous']
    X = df[features]
    y = df['Fertilizer_Encoded']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)

    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))

    print(f"Fertilizer Model - Train Accuracy: {train_acc * 100:.2f}%")
    print(f"Fertilizer Model - Test Accuracy:  {test_acc * 100:.2f}%")

    model_artifacts = {
        'model': model,
        'soil_encoder': soil_encoder,
        'crop_encoder': crop_encoder,
        'fertilizer_encoder': fertilizer_encoder,
        'features': features,
        'accuracy': round(float(test_acc), 4)
    }

    joblib.dump(model_artifacts, os.path.join(save_dir, 'fertilizer_model.joblib'))
    print("Fertilizer model saved to:", os.path.join(save_dir, 'fertilizer_model.joblib'))

    metrics = {
        'total_samples': len(df),
        'train_accuracy': round(float(train_acc), 4),
        'test_accuracy': round(float(test_acc), 4),
        'fertilizers': fertilizer_encoder.classes_.tolist(),
        'crops': crop_encoder.classes_.tolist(),
        'soil_types': soil_encoder.classes_.tolist()
    }
    with open(os.path.join(save_dir, 'fertilizer_metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)

    return model_artifacts, metrics

def analyze_soil_and_recommend(n_val, p_val, k_val, ph_val, crop_name):
    """
    Transparent Agronomic Nutrient Engine:
    Computes exact nutrient deficiencies/excesses against documented ICAR/agricultural requirements,
    diagnoses soil pH balance, and formulates precise fertilizer recommendations with rationale.
    """
    crop_key = crop_name.strip().lower()
    crop_info = CROP_NUTRIENT_DATABASE.get(
        crop_key,
        {'N': 80, 'P': 40, 'K': 40, 'pH_min': 6.0, 'pH_max': 7.5, 'season': 'General', 'water': 'Medium'}
    )

    n_req = crop_info['N']
    p_req = crop_info['P']
    k_req = crop_info['K']
    ph_min = crop_info['pH_min']
    ph_max = crop_info['pH_max']

    # 1. Nutrient Gaps
    diff_n = round(n_req - n_val, 1)
    diff_p = round(p_req - p_val, 1)
    diff_k = round(k_req - k_val, 1)

    def classify_nutrient(actual, target):
        ratio = actual / max(target, 1)
        if ratio < 0.75:
            return 'Deficient (High Deficit)'
        elif ratio < 0.90:
            return 'Slightly Low'
        elif ratio <= 1.25:
            return 'Optimal'
        elif ratio <= 1.50:
            return 'Slightly High'
        else:
            return 'Excess'

    status_n = classify_nutrient(n_val, n_req)
    status_p = classify_nutrient(p_val, p_req)
    status_k = classify_nutrient(k_val, k_req)

    # 2. pH Diagnosis
    if ph_val < 5.5:
        ph_status = 'Strongly Acidic'
        ph_recommendation = {
            'action': 'Apply Agricultural Lime (CaCO3) or Dolomite Limestone',
            'dosage': '1.5 - 2.5 tonnes/hectare (approx 600 - 1000 kg/acre)',
            'timing': 'Broadcast 3-4 weeks prior to sowing and incorporate into top 15 cm of soil.',
            'scientific_reason': 'Soil pH below 5.5 severely restricts phosphorus availability and induces toxic concentrations of soluble aluminum (Al3+) and manganese (Mn2+).'
        }
    elif ph_val < ph_min:
        ph_status = 'Moderately Acidic'
        ph_recommendation = {
            'action': 'Apply Moderate Liming or Well-Decomposed Farmyard Manure',
            'dosage': '500 - 800 kg/acre of calcitic lime or 5 tonnes/acre of organic compost',
            'timing': 'Apply during preliminary tillage.',
            'scientific_reason': f'Soil pH ({ph_val}) is lower than the optimum threshold ({ph_min}-{ph_max}) for {crop_name.title()}, mildly inhibiting nitrogen fixation and microbial activity.'
        }
    elif ph_val > 8.0:
        ph_status = 'Alkaline / Sodic Tendency'
        ph_recommendation = {
            'action': 'Apply Agricultural Gypsum (CaSO4.2H2O) and Organic Mulch / Sulfur',
            'dosage': '1.0 - 2.0 tonnes/hectare (approx 400 - 800 kg/acre)',
            'timing': 'Apply prior to monsoon/pre-sowing irrigation with good soil drainage.',
            'scientific_reason': f'Soil pH ({ph_val}) exceeds 8.0, which binds phosphorus as insoluble calcium phosphate and precipitates essential micronutrients (Zinc, Iron, Manganese).'
        }
    elif ph_val > ph_max:
        ph_status = 'Slightly Alkaline'
        ph_recommendation = {
            'action': 'Incorporate Green Manure (Dhaincha/Sesbania) or Ammonium-Based Fertilizers',
            'dosage': '10 tonnes/ha organic manure + sulfur bentonite 25 kg/acre',
            'timing': 'Incorporate during basal plowing.',
            'scientific_reason': f'Slightly higher pH than the optimal ({ph_min}-{ph_max}) for {crop_name.title()}; organic acids from decomposition naturally buffer alkalinity.'
        }
    else:
        ph_status = 'Optimal'
        ph_recommendation = {
            'action': 'No chemical amendment needed',
            'dosage': 'Maintain through regular organic matter (5 t/ha FYM)',
            'timing': 'Annual basal incorporation.',
            'scientific_reason': f'Soil pH ({ph_val}) is in the prime range ({ph_min} - {ph_max}) for maximum bioavailability of all essential macro and micro nutrients.'
        }

    # 3. Fertilizer Formulation
    recommendations = []

    # Case A: High deficit across both P and K
    if diff_p > 15 and diff_k > 20:
        recommendations.append({
            'fertilizer': 'NPK 10-26-26 Complex',
            'target_nutrient': 'Phosphorus & Potassium',
            'rationale': f'Both Phosphorus (gap: {diff_p} kg/ha) and Potassium (gap: {diff_k} kg/ha) are severely deficient. NPK 10-26-26 simultaneously replenishes root and fruit development nutrients.',
            'dosage_guideline': f'{int(max(diff_p * 3.8, diff_k * 3.8))} kg/hectare (approx {int(max(diff_p * 1.5, diff_k * 1.5))} kg/acre)',
            'application_method': FERTILIZER_SPECS['10-26-26']['application_method'],
            'specs': FERTILIZER_SPECS['10-26-26']
        })
    # Case B: High deficit in Nitrogen and Phosphorus
    elif diff_n > 20 and diff_p > 15:
        recommendations.append({
            'fertilizer': 'DAP (Diammonium Phosphate 18-46-0)',
            'target_nutrient': 'Phosphorus + Starter Nitrogen',
            'rationale': f'Significant deficit in Phosphorus ({diff_p} kg/ha) and Nitrogen ({diff_n} kg/ha). DAP supplies concentrated water-soluble phosphate with 18% ammoniacal nitrogen.',
            'dosage_guideline': f'{int(diff_p * 2.17)} kg/hectare (approx {int(diff_p * 0.88)} kg/acre)',
            'application_method': FERTILIZER_SPECS['DAP']['application_method'],
            'specs': FERTILIZER_SPECS['DAP']
        })

    # Individual deficiencies
    if diff_n > 10:
        # Check if already partially addressed
        urea_needed_kg = round(diff_n / 0.46, 1)
        recommendations.append({
            'fertilizer': 'Urea (46% N)',
            'target_nutrient': 'Nitrogen',
            'rationale': f'Soil Nitrogen is deficient by {diff_n} kg/ha for {crop_name.title()}. Nitrogen is vital for vegetative expansion, stem elongation, and chlorophyll synthesis.',
            'dosage_guideline': f'{int(urea_needed_kg)} kg/hectare (approx {int(urea_needed_kg * 0.4)} kg/acre)',
            'application_method': FERTILIZER_SPECS['Urea']['application_method'],
            'specs': FERTILIZER_SPECS['Urea']
        })
    elif diff_n < -25:
        recommendations.append({
            'fertilizer': 'Nitrogen Reduction Notice',
            'target_nutrient': 'Nitrogen Excess',
            'rationale': f'Soil Nitrogen is currently in excess (+{-diff_n} kg/ha above required {n_req} kg/ha). Do not apply urea or nitrogenous top dressing to avoid crop lodging, pest susceptibility, and delayed maturity.',
            'dosage_guideline': 'Zero additional nitrogen input',
            'application_method': 'Withhold synthetic nitrogen; irrigate moderately.',
            'specs': {'nutrients': 'N/A', 'description': 'Nitrogen regulation caution', 'application_method': 'Withhold top dressing'}
        })

    if diff_p > 10 and not any('DAP' in r['fertilizer'] or '10-26-26' in r['fertilizer'] for r in recommendations):
        ssp_needed = round(diff_p / 0.16, 1)
        recommendations.append({
            'fertilizer': 'Single Super Phosphate (SSP - 16% P2O5)',
            'target_nutrient': 'Phosphorus',
            'rationale': f'Phosphorus deficit of {diff_p} kg/ha detected. SSP provides 16% P2O5 plus 11% Sulfur and 19% Calcium for excellent root development and seed formation.',
            'dosage_guideline': f'{int(ssp_needed)} kg/hectare (approx {int(ssp_needed * 0.4)} kg/acre)',
            'application_method': FERTILIZER_SPECS['SSP']['application_method'],
            'specs': FERTILIZER_SPECS['SSP']
        })

    if diff_k > 10 and not any('10-26-26' in r['fertilizer'] for r in recommendations):
        mop_needed = round(diff_k / 0.60, 1)
        recommendations.append({
            'fertilizer': 'Muriate of Potash (MOP 60% K2O)',
            'target_nutrient': 'Potassium',
            'rationale': f'Potassium is deficient by {diff_k} kg/ha. Potash strengthens cellular walls, controls stomatal opening, and confers resistance against lodging, drought, and pathogens.',
            'dosage_guideline': f'{int(mop_needed)} kg/hectare (approx {int(mop_needed * 0.4)} kg/acre)',
            'application_method': FERTILIZER_SPECS['MOP']['application_method'],
            'specs': FERTILIZER_SPECS['MOP']
        })

    # If all nutrients are optimal
    if not recommendations:
        recommendations.append({
            'fertilizer': 'Balanced Maintenance / Organic Compost',
            'target_nutrient': 'Soil Health Maintenance',
            'rationale': f'All primary macronutrients (N, P, K) are well balanced and within optimal agronomic thresholds for {crop_name.title()}. Only routine maintenance is recommended.',
            'dosage_guideline': '5 - 10 tonnes/hectare of well-decomposed Farmyard Manure (FYM) or Vermicompost',
            'application_method': 'Incorporate during basal land preparation.',
            'specs': {'nutrients': 'Organic nutrients & humic acids', 'description': 'Maintains soil microbial biodiversity and organic carbon pool.', 'application_method': 'Basal tillage incorporation.'}
        })

    return {
        'crop': crop_name.title(),
        'crop_requirements': {
            'target_n': n_req,
            'target_p': p_req,
            'target_k': k_req,
            'optimal_ph_range': f"{ph_min} - {ph_max}",
            'season': crop_info.get('season', 'General'),
            'water_requirement': crop_info.get('water', 'Medium')
        },
        'soil_analysis': {
            'nitrogen': {'current': n_val, 'target': n_req, 'difference': diff_n, 'status': status_n},
            'phosphorus': {'current': p_val, 'target': p_req, 'difference': diff_p, 'status': status_p},
            'potassium': {'current': k_val, 'target': k_req, 'difference': diff_k, 'status': status_k},
            'ph': {'current': ph_val, 'optimal_min': ph_min, 'optimal_max': ph_max, 'status': ph_status}
        },
        'ph_remediation': ph_recommendation,
        'fertilizer_recommendations': recommendations
    }

if __name__ == '__main__':
    train_fertilizer_classifier()
    print("\nTesting agronomic recommendation for Rice with low N & P:")
    res = analyze_soil_and_recommend(30, 15, 45, 5.2, 'rice')
    print("Fertilizer recommendations count:", len(res['fertilizer_recommendations']))
    for r in res['fertilizer_recommendations']:
        print("-", r['fertilizer'], ":", r['target_nutrient'])
    print("pH recommendation:", res['ph_remediation']['action'])
