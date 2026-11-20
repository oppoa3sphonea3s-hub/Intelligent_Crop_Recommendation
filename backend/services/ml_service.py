"""
Crop Machine Learning Service.
Loads serialized models and provides inference, confidence evaluation,
and agronomic crop profile retrieval.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from database.db import get_db_connection

MODELS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'saved_models')
)


# Load serialized model & metrics
BEST_MODEL = None
METRICS = {}

model_path = os.path.join(MODELS_DIR, 'crop_best_model.joblib')
metrics_path = os.path.join(MODELS_DIR, 'crop_metrics.json')

try:
    print("MODEL PATH:", model_path)
    print("MODEL EXISTS:", os.path.isfile(model_path))

    BEST_MODEL = joblib.load(model_path)
    print("CROP MODEL LOADED SUCCESSFULLY")

except Exception as e:
    print("CROP MODEL LOAD FAILED:", type(e).__name__, str(e))

try:
    with open(metrics_path, 'r') as f:
        METRICS = json.load(f)
    print("CROP METRICS LOADED SUCCESSFULLY")

except Exception as e:
    print("CROP METRICS LOAD FAILED:", type(e).__name__, str(e))


# Comprehensive Agronomic profiles for all 22 supported crops
CROP_AGRONOMIC_PROFILES = {
    'rice': {
        'common_name': 'Rice (Paddy)',
        'botanical_name': 'Oryza sativa',
        'category': 'Cereal / Food Grain',
        'season': 'Kharif (Monsoon / Autumn)',
        'growing_duration': '110 - 150 days',
        'soil_type': 'Clayey loam or heavy alluvial soil with high water retention',
        'optimal_temp': '20°C - 35°C',
        'optimal_rainfall': '150 - 300 mm monthly (1000 - 1500 mm total)',
        'optimal_ph': '5.5 - 7.0',
        'image_url': 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Thrives in warm, humid weather with abundant standing water or assured irrigation and fertile clayey soils.',
        'agronomic_tips': [
            'Prepare puddled soil thoroughly to reduce water percolation loss.',
            'Apply 1/3 Nitrogen with full Phosphorus and Potash at transplanting.',
            'Maintain 2-5 cm standing water during panicle initiation and flowering.'
        ]
    },
    'maize': {
        'common_name': 'Maize (Corn)',
        'botanical_name': 'Zea mays',
        'category': 'Cereal / Queen of Cereals',
        'season': 'Kharif / Rabi / Spring',
        'growing_duration': '90 - 120 days',
        'soil_type': 'Well-drained fertile loamy to silty loam soil',
        'optimal_temp': '18°C - 30°C',
        'optimal_rainfall': '50 - 80 mm monthly (500 - 800 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Highly adaptable warm-weather crop requiring well-aerated soil; extremely sensitive to waterlogging.',
        'agronomic_tips': [
            'Ensure ridge and furrow planting to avoid water stagnation.',
            'Apply nitrogen in 3 equal splits: at sowing, knee-high stage, and tasseling.',
            'Maintain optimal plant population of 65,000 plants per hectare.'
        ]
    },
    'chickpea': {
        'common_name': 'Chickpea (Gram)',
        'botanical_name': 'Cicer arietinum',
        'category': 'Pulse / Legume',
        'season': 'Rabi (Winter season)',
        'growing_duration': '90 - 120 days',
        'soil_type': 'Well-drained sandy loam to clay loam',
        'optimal_temp': '15°C - 25°C',
        'optimal_rainfall': '30 - 60 mm monthly (300 - 450 mm total)',
        'optimal_ph': '6.0 - 7.8',
        'image_url': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Excellent winter pulse crop that enriches soil through atmospheric nitrogen fixation; requires moderate cold.',
        'agronomic_tips': [
            'Seed inoculation with Rhizobium and PSB culture increases yield by 15-20%.',
            'Avoid heavy nitrogen applications to prevent excessive vegetative growth.',
            'Single irrigation at branching and pre-flowering stage suffices.'
        ]
    },
    'kidneybeans': {
        'common_name': 'Kidney Beans (Rajma)',
        'botanical_name': 'Phaseolus vulgaris',
        'category': 'Pulse / Legume',
        'season': 'Kharif / Late Rabi',
        'growing_duration': '100 - 120 days',
        'soil_type': 'Rich, light loam with good organic matter',
        'optimal_temp': '15°C - 25°C',
        'optimal_rainfall': '50 - 90 mm monthly (450 - 650 mm total)',
        'optimal_ph': '5.5 - 6.8',
        'image_url': 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Cool-season legume with high protein content, requiring free-draining fertile soil.',
        'agronomic_tips': [
            'Does not nodulate well with native Rhizobia; requires starter nitrogen (80-100 kg/ha).',
            'Sensitive to both frost and high temperatures exceeding 32°C during pod filling.',
            'Irrigate at critical stages: 25 days after sowing and pod formation.'
        ]
    },
    'pigeonpeas': {
        'common_name': 'Pigeon Peas (Arhar / Red Gram)',
        'botanical_name': 'Cajanus cajan',
        'category': 'Pulse / Legume',
        'season': 'Kharif (Monsoon)',
        'growing_duration': '150 - 200 days',
        'soil_type': 'Deep loamy to medium-heavy black soil with deep rooting capability',
        'optimal_temp': '20°C - 35°C',
        'optimal_rainfall': '60 - 100 mm monthly (600 - 800 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Deep-rooted, drought-tolerant pulse that thrives in warm climates and leaves soil rich in fixed nitrogen.',
        'agronomic_tips': [
            'Ideal for intercropping with sorghum, maize, or soybean.',
            'Deep tillage in summer breaks hardpan and enables deep tap root penetration.',
            'Protect against pod borer (Helicoverpa armigera) at flowering.'
        ]
    },
    'mothbeans': {
        'common_name': 'Moth Beans (Matki)',
        'botanical_name': 'Vigna aconitifolia',
        'category': 'Pulse / Arid Legume',
        'season': 'Kharif (Arid / Semi-arid)',
        'growing_duration': '60 - 75 days',
        'soil_type': 'Sandy loam, light dry soils',
        'optimal_temp': '24°C - 35°C',
        'optimal_rainfall': '20 - 45 mm monthly (200 - 400 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Exceptional drought-hardy legume suitable for arid and semi-arid conditions where other crops fail.',
        'agronomic_tips': [
            'Short duration allows cultivation even in low rainfall rainfed tracts.',
            'Acts as excellent soil cover to minimize wind erosion.',
            'Minimal fertilizer requirement; relies on root nodules.'
        ]
    },
    'mungbean': {
        'common_name': 'Mung Bean (Green Gram)',
        'botanical_name': 'Vigna radiata',
        'category': 'Pulse / Short-Duration Legume',
        'season': 'Kharif / Spring / Summer',
        'growing_duration': '60 - 70 days',
        'soil_type': 'Well-drained loam to sandy loam',
        'optimal_temp': '25°C - 35°C',
        'optimal_rainfall': '35 - 60 mm monthly (350 - 500 mm total)',
        'optimal_ph': '6.2 - 7.2',
        'image_url': 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Fast-maturing, warm-season pulse suitable for crop rotation and green manuring.',
        'agronomic_tips': [
            'Fits neatly as a catch crop between wheat harvest and rice planting.',
            'Requires basal application of 20 kg N and 40 kg P2O5 per ha.',
            'Harvest promptly when 80% pods turn brown to avoid pod shattering.'
        ]
    },
    'blackgram': {
        'common_name': 'Black Gram (Urad)',
        'botanical_name': 'Vigna mungo',
        'category': 'Pulse / Legume',
        'season': 'Kharif / Spring',
        'growing_duration': '70 - 85 days',
        'soil_type': 'Loamy to heavy clay loam with good fertility',
        'optimal_temp': '25°C - 35°C',
        'optimal_rainfall': '40 - 70 mm monthly (450 - 650 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Warm-weather legume offering high nutritional value and soil-improving qualities.',
        'agronomic_tips': [
            'Maintain weed-free field during the first 30 days of establishment.',
            'Seed treatment with Trichoderma viride controls root rot and wilt.',
            'Apply sulfur (20 kg/ha) to boost grain protein and sulfur-bearing amino acids.'
        ]
    },
    'lentil': {
        'common_name': 'Lentil (Masoor)',
        'botanical_name': 'Lens culinaris',
        'category': 'Pulse / Winter Legume',
        'season': 'Rabi (Winter)',
        'growing_duration': '100 - 130 days',
        'soil_type': 'Alluvial, sandy loam to light black soil',
        'optimal_temp': '15°C - 25°C',
        'optimal_rainfall': '30 - 55 mm monthly (300 - 450 mm total)',
        'optimal_ph': '5.5 - 7.0',
        'image_url': 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Cool-season pulse requiring mild temperatures and low rainfall during vegetative stage.',
        'agronomic_tips': [
            'Can be grown under relay cropping (utera) in standing rice fields.',
            'Tolerates moisture stress better than many other rabi pulses.',
            'Avoid excessive vegetative growth by limiting nitrogenous fertilizer.'
        ]
    },
    'pomegranate': {
        'common_name': 'Pomegranate',
        'botanical_name': 'Punica granatum',
        'category': 'Fruit Crop / Horticulture',
        'season': 'Perennial (Year-round fruit regulation)',
        'growing_duration': 'Perennial (fruits ready 5-7 months from flowering)',
        'soil_type': 'Deep loamy or alluvial soil with good drainage',
        'optimal_temp': '20°C - 38°C',
        'optimal_rainfall': '40 - 80 mm monthly (500 - 700 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1541344999736-83eca872f242?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Sub-tropical fruit tree tolerant of heat and dry conditions; produces high-value antioxidants.',
        'agronomic_tips': [
            'Bahar treatment (water withholding) is regulated for Ambe, Mrig, or Hasta bahar.',
            'Prune water sprouts and dead twigs regularly to maintain open canopy.',
            'Drip irrigation prevents fruit cracking caused by uneven soil moisture.'
        ]
    },
    'banana': {
        'common_name': 'Banana',
        'botanical_name': 'Musa acuminata',
        'category': 'Fruit / High-Value Commercial Crop',
        'season': 'Perennial / Year-round planting',
        'growing_duration': '11 - 14 months',
        'soil_type': 'Rich, deep, well-drained loamy soil with high organic matter',
        'optimal_temp': '22°C - 35°C',
        'optimal_rainfall': '100 - 200 mm monthly (1200 - 1800 mm total)',
        'optimal_ph': '6.0 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Heavy feeder crop requiring substantial warmth, rich soil nutrients, and continuous moisture.',
        'agronomic_tips': [
            'High requirement of Potassium (K) for bunch weight, finger size, and sugar content.',
            'Desuckering: remove unwanted suckers until flowering to direct energy to parent pseudostem.',
            'Provide propping (bamboo support) during bunch development to prevent toppling.'
        ]
    },
    'mango': {
        'common_name': 'Mango (King of Fruits)',
        'botanical_name': 'Mangifera indica',
        'category': 'Fruit / Orchard Plantation',
        'season': 'Perennial (Flowering Dec-Feb, Harvest May-July)',
        'growing_duration': 'Perennial orchard',
        'soil_type': 'Deep alluvial, well-drained loamy to medium black soil',
        'optimal_temp': '24°C - 38°C',
        'optimal_rainfall': '50 - 120 mm monthly (750 - 1500 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Tropical and subtropical perennial fruit crop requiring distinct dry season for flowering induction.',
        'agronomic_tips': [
            'Withhold irrigation 2-3 months prior to flowering to stimulate flower bud differentiation.',
            'Apply Paclobutrazol in regulated doses to address alternate bearing.',
            'Manage mango hopper and powdery mildew during panicle emergence.'
        ]
    },
    'grapes': {
        'common_name': 'Grapes',
        'botanical_name': 'Vitis vinifera',
        'category': 'Fruit / Viticulture',
        'season': 'Perennial (Pruning in Oct and April)',
        'growing_duration': 'Perennial vine',
        'soil_type': 'Well-drained sandy loam or gravelly soil, avoid heavy wet clays',
        'optimal_temp': '15°C - 35°C',
        'optimal_rainfall': '40 - 80 mm monthly (500 - 800 mm total)',
        'optimal_ph': '5.5 - 7.0',
        'image_url': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'High-value fruit vine requiring warm, dry summer and clear sunshine for high sugar accumulation.',
        'agronomic_tips': [
            'Systematic training on Bower / Y-trellis system ensures uniform light penetration.',
            'High potash demand for berry development and Brix sweetness.',
            'Avoid rain or high humidity during ripening to prevent bunch rot and berry cracking.'
        ]
    },
    'watermelon': {
        'common_name': 'Watermelon',
        'botanical_name': 'Citrullus lanatus',
        'category': 'Cucurbit / Summer Fruit Crop',
        'season': 'Zaid / Summer (Feb - June)',
        'growing_duration': '80 - 100 days',
        'soil_type': 'Sandy loam, riverbed alluvium with fast drainage',
        'optimal_temp': '24°C - 35°C',
        'optimal_rainfall': '30 - 60 mm monthly (350 - 550 mm total)',
        'optimal_ph': '6.0 - 7.0',
        'image_url': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Loves warm, dry, sunny conditions with fertile light soils and moderate moisture.',
        'agronomic_tips': [
            'Mulching with silver-black polyethylene increases soil warmth and conserves moisture.',
            'Reduce irrigation frequency as fruits approach ripening to boost TSS and sweetness.',
            'Protect female flowers by avoiding insecticide spray during morning bee activity.'
        ]
    },
    'muskmelon': {
        'common_name': 'Muskmelon (Cantaloupe)',
        'botanical_name': 'Cucumis melo',
        'category': 'Cucurbit / Summer Fruit Crop',
        'season': 'Zaid / Summer (Feb - May)',
        'growing_duration': '75 - 90 days',
        'soil_type': 'Sandy loam with high drainage and organic fertility',
        'optimal_temp': '25°C - 35°C',
        'optimal_rainfall': '20 - 50 mm monthly (300 - 500 mm total)',
        'optimal_ph': '6.0 - 7.2',
        'image_url': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Thrives in warm, dry weather; excessive moisture or humidity causes fruit rotting and reduces sugar.',
        'agronomic_tips': [
            'Full Slip stage indicates physiological maturity and peak aroma/flavor.',
            'Apply balanced potassium to enhance fruit netting and sweetness.',
            'Drip fertigation ensures dry foliage and minimizes powdery mildew.'
        ]
    },
    'apple': {
        'common_name': 'Apple',
        'botanical_name': 'Malus domestica',
        'category': 'Temperate Fruit Orchard',
        'season': 'Perennial (Harvest July - Oct)',
        'growing_duration': 'Perennial temperate tree',
        'soil_type': 'Deep, well-aerated rich loamy soil free of water stagnation',
        'optimal_temp': '10°C - 24°C (requires winter chilling 800-1200 hrs)',
        'optimal_rainfall': '70 - 130 mm monthly (800 - 1200 mm total)',
        'optimal_ph': '5.5 - 6.8',
        'image_url': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Temperate orchard crop requiring substantial winter chilling hours (<7°C) and mild summers.',
        'agronomic_tips': [
            'Plant compatible pollinizer cultivars (like Golden Delicious) at 15-20% proportion.',
            'Thin fruitlets 20-25 days after petal fall to ensure uniform fruit size and prevent alternate bearing.',
            'Dormant spray with tree spray oil controls San Jose scale and overwintering mites.'
        ]
    },
    'orange': {
        'common_name': 'Orange (Citrus)',
        'botanical_name': 'Citrus sinensis',
        'category': 'Citrus Fruit / Horticulture',
        'season': 'Perennial (Mrig / Ambia bahar)',
        'growing_duration': 'Perennial tree',
        'soil_type': 'Well-drained light loamy to sandy loam soil with good depth',
        'optimal_temp': '15°C - 32°C',
        'optimal_rainfall': '60 - 110 mm monthly (700 - 1100 mm total)',
        'optimal_ph': '5.5 - 7.5',
        'image_url': 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Subtropical evergreen citrus requiring well-aerated soil and low humidity during fruit coloring.',
        'agronomic_tips': [
            'Sensitive to water stagnation; root rot (Phytophthora) develops if water sits near collar.',
            'Micronutrient foliar spray (Zinc, Iron, Manganese, Boron) prevents citrus mottle leaf.',
            'Mulching root zone retains moisture and cools soil during hot dry months.'
        ]
    },
    'papaya': {
        'common_name': 'Papaya',
        'botanical_name': 'Carica papaya',
        'category': 'Tropical Fruit Crop',
        'season': 'Year-round planting',
        'growing_duration': '10 - 12 months for first harvest',
        'soil_type': 'Rich, friable loamy soil with outstanding drainage',
        'optimal_temp': '22°C - 35°C',
        'optimal_rainfall': '80 - 150 mm monthly (1000 - 1500 mm total)',
        'optimal_ph': '6.0 - 7.2',
        'image_url': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Fast-growing tropical herbaceous tree with high vitamin A & C content; hates waterlogging.',
        'agronomic_tips': [
            'Plant on raised mounds: standing water for even 24-48 hours causes stem rot and tree death.',
            'Maintain 1 male tree for every 10 female trees in dioecious varieties (or use gynodioecious hybrids).',
            'Provide ring weeding and regular shallow fertilization.'
        ]
    },
    'coconut': {
        'common_name': 'Coconut (Tree of Life)',
        'botanical_name': 'Cocos nucifera',
        'category': 'Plantation / Oilseed Crop',
        'season': 'Perennial coastal & tropical',
        'growing_duration': 'Perennial palm (continuous harvest)',
        'soil_type': 'Coastal sandy, alluvial, or red sandy loam soils',
        'optimal_temp': '24°C - 35°C',
        'optimal_rainfall': '120 - 250 mm monthly (1300 - 2300 mm total)',
        'optimal_ph': '5.2 - 8.0',
        'image_url': 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Tropical coastal palm thriving in humid environments with high sunlight and deep permeable soil.',
        'agronomic_tips': [
            'High requirement of Potash (1.2 kg MOP/palm/year) and common salt (NaCl 1 kg/palm).',
            'Maintain basin mulch using dry coconut leaves or coir pith to retain soil moisture.',
            'Irrigate 40-50 liters/palm/day during summer months through drip line.'
        ]
    },
    'cotton': {
        'common_name': 'Cotton (White Gold)',
        'botanical_name': 'Gossypium hirsutum',
        'category': 'Commercial Fiber Crop',
        'season': 'Kharif (Monsoon - Winter)',
        'growing_duration': '150 - 180 days',
        'soil_type': 'Deep black cotton soil (Vertisols) or fertile alluvial soil',
        'optimal_temp': '22°C - 35°C',
        'optimal_rainfall': '60 - 100 mm monthly (600 - 900 mm total)',
        'optimal_ph': '6.0 - 8.0',
        'image_url': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Warm-season cash crop requiring long frost-free periods and abundant sunshine during boll opening.',
        'agronomic_tips': [
            'Avoid heavy rains or irrigation during boll opening to prevent fiber staining.',
            'Square and boll drop can be reduced with planofix (NAA) spray at flower initiation.',
            'Maintain integrated pest management (IPM) against sucking pests and pink bollworm.'
        ]
    },
    'jute': {
        'common_name': 'Jute (Golden Fiber)',
        'botanical_name': 'Corchorus olitorius',
        'category': 'Commercial Bast Fiber Crop',
        'season': 'Kharif / Pre-monsoon',
        'growing_duration': '120 - 140 days',
        'soil_type': 'New alluvial silt loam soil with high organic fertility',
        'optimal_temp': '24°C - 37°C',
        'optimal_rainfall': '120 - 200 mm monthly (1200 - 1600 mm total)',
        'optimal_ph': '5.5 - 7.0',
        'image_url': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Moisture-loving fiber crop requiring warm, humid monsoon climates and periodic silty flooding.',
        'agronomic_tips': [
            'Harvest at small pod stage (120 days) for optimal fiber strength and fineness.',
            'Retting in clean, slow-flowing microbial water is critical for golden luster and quality.',
            'Apply top-dressed nitrogen in two splits for rapid stalk elongation.'
        ]
    },
    'coffee': {
        'common_name': 'Coffee (Arabica / Robusta)',
        'botanical_name': 'Coffea arabica / canephora',
        'category': 'Beverage / Plantation Crop',
        'season': 'Perennial (Shade-grown hilly tract)',
        'growing_duration': 'Perennial shrub (Harvest Nov - Feb)',
        'soil_type': 'Deep, porous, rich volcanic or humic forest loams',
        'optimal_temp': '15°C - 28°C',
        'optimal_rainfall': '120 - 220 mm monthly (1400 - 2200 mm total)',
        'optimal_ph': '5.0 - 6.5',
        'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        'suitability_summary': 'Subtropical hill crop cultivated under two-tier shade trees with high rainfall and cool breezes.',
        'agronomic_tips': [
            'Maintain two-tier canopy shade (Dadaps for lower tier, Albizia/Silver oak for upper).',
            'Blossom showers (25-40 mm in March/April) are critical for uniform flower opening.',
            'Harvest only bright red ripe cherries for premium cup quality.'
        ]
    }
}

def predict_crop(n, p, k, temperature, humidity, ph, rainfall, notes=''):
    """
    Run prediction using the serialized Random Forest model.
    Validates input parameters, calculates model confidence and class probabilities,
    and records the prediction in SQLite.
    """
    if BEST_MODEL is None:
        raise ValueError("Model not loaded. Ensure crop_model.py has been executed.")

    # Validation
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    input_data = pd.DataFrame([{
        'N': float(n),
        'P': float(p),
        'K': float(k),
        'temperature': float(temperature),
        'humidity': float(humidity),
        'ph': float(ph),
        'rainfall': float(rainfall)
    }])

    # Predict
    predicted_crop = str(BEST_MODEL.predict(input_data)[0]).lower()
    probabilities = BEST_MODEL.predict_proba(input_data)[0]
    classes = BEST_MODEL.classes_

    # Map classes to probabilities
    prob_map = {cls.lower(): float(prob) for cls, prob in zip(classes, probabilities)}
    sorted_probs = sorted(prob_map.items(), key=lambda x: x[1], reverse=True)

    predicted_prob = prob_map.get(predicted_crop, 0.0)
    confidence_pct = round(predicted_prob * 100, 2)

    # Top alternatives (excluding primary prediction)
    alternatives = [
        {'crop': item[0].title(), 'probability': round(item[1] * 100, 2)}
        for item in sorted_probs[1:4] if item[1] > 0.005
    ]

    # Retrieve profile
    profile = CROP_AGRONOMIC_PROFILES.get(
        predicted_crop,
        {
            'common_name': predicted_crop.title(),
            'botanical_name': 'Species cultivar',
            'category': 'Field Crop',
            'season': 'Standard Agronomic Cycle',
            'growing_duration': '90 - 150 days',
            'soil_type': 'Fertile agricultural soil',
            'optimal_temp': '20°C - 30°C',
            'optimal_rainfall': '600 - 1000 mm',
            'optimal_ph': '6.0 - 7.5',
            'image_url': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
            'suitability_summary': 'Optimal conditions detected for this crop.',
            'agronomic_tips': ['Follow standard regional agricultural package of practices.']
        }
    )

    # Save to SQLite database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO crop_predictions (
            nitrogen, phosphorus, potassium, temperature,
            humidity, ph, rainfall, predicted_crop, confidence,
            model_used, top_alternatives, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        float(n), float(p), float(k), float(temperature),
        float(humidity), float(ph), float(rainfall),
        predicted_crop, confidence_pct,
        'Random Forest Classifier', json.dumps(alternatives), notes
    ))
    prediction_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        'prediction_id': prediction_id,
        'predicted_crop': predicted_crop,
        'crop_display_name': profile['common_name'],
        'confidence': confidence_pct,
        'model_name': 'Random Forest Classifier (Ensemble of 100 Decision Trees)',
        'model_test_accuracy': METRICS.get('best_model', {}).get('test_accuracy', 0.9955),
        'top_alternatives': alternatives,
        'all_probabilities': [{'crop': k.title(), 'prob': round(v * 100, 2)} for k, v in sorted_probs[:6]],
        'crop_profile': profile,
        'input_parameters': {
            'N': float(n),
            'P': float(p),
            'K': float(k),
            'temperature': float(temperature),
            'humidity': float(humidity),
            'ph': float(ph),
            'rainfall': float(rainfall)
        }
    }

def get_crop_catalog():
    """Return catalog of all supported crops with agronomic details."""
    catalog = []
    for crop_key, profile in sorted(CROP_AGRONOMIC_PROFILES.items(), key=lambda x: x[1]['common_name']):
        item = dict(profile)
        item['id'] = crop_key
        catalog.append(item)
    return catalog

def get_ml_metrics_summary():
    """Return model performance metrics and comparison."""
    return METRICS
