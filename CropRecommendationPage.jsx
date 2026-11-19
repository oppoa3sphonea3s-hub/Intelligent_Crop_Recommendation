import React, { useState } from 'react';
import { 
  Sprout, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Thermometer, 
  Droplet, 
  CloudRain, 
  Activity, 
  FlaskConical, 
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const PRESET_SCENARIOS = [
  {
    name: 'Paddy / Rice Conditions',
    desc: 'Warm, high humidity and monsoon rainfall',
    values: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 24.5, humidity: 82, ph: 6.5, rainfall: 240 }
  },
  {
    name: 'Cotton Belt',
    desc: 'High nitrogen, moderate rainfall and warm sun',
    values: { nitrogen: 120, phosphorus: 45, potassium: 20, temperature: 28.0, humidity: 72, ph: 7.2, rainfall: 85 }
  },
  {
    name: 'Apple Orchard',
    desc: 'High P & K, cool temperate temperatures',
    values: { nitrogen: 25, phosphorus: 130, potassium: 200, temperature: 16.0, humidity: 62, ph: 6.2, rainfall: 110 }
  },
  {
    name: 'Chickpea / Pulse',
    desc: 'Low humidity, rabi season cool temperatures',
    values: { nitrogen: 38, phosphorus: 68, potassium: 79, temperature: 18.8, humidity: 18, ph: 7.3, rainfall: 80 }
  },
  {
    name: 'Coffee Plantation',
    desc: 'Tropical hills, high rainfall and fertile loam',
    values: { nitrogen: 102, phosphorus: 28, potassium: 32, temperature: 25.0, humidity: 65, ph: 6.2, rainfall: 175 }
  }
];

export default function CropRecommendationPage({ setActivePage, setPredictionResult }) {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    const n = Number(formData.nitrogen);
    if (formData.nitrogen === '' || isNaN(n) || n < 0 || n > 300) {
      newErrors.nitrogen = 'Enter Nitrogen between 0 and 300 kg/ha';
    }

    const p = Number(formData.phosphorus);
    if (formData.phosphorus === '' || isNaN(p) || p < 0 || p > 300) {
      newErrors.phosphorus = 'Enter Phosphorus between 0 and 300 kg/ha';
    }

    const k = Number(formData.potassium);
    if (formData.potassium === '' || isNaN(k) || k < 0 || k > 300) {
      newErrors.potassium = 'Enter Potassium between 0 and 300 kg/ha';
    }

    const t = Number(formData.temperature);
    if (formData.temperature === '' || isNaN(t) || t < -10 || t > 60) {
      newErrors.temperature = 'Enter Temperature between -10°C and 60°C';
    }

    const h = Number(formData.humidity);
    if (formData.humidity === '' || isNaN(h) || h < 0 || h > 100) {
      newErrors.humidity = 'Enter Humidity between 0% and 100%';
    }

    const ph = Number(formData.ph);
    if (formData.ph === '' || isNaN(ph) || ph < 0 || ph > 14) {
      newErrors.ph = 'Enter Soil pH between 0.0 and 14.0';
    }

    const r = Number(formData.rainfall);
    if (formData.rainfall === '' || isNaN(r) || r < 0 || r > 1000) {
      newErrors.rainfall = 'Enter Rainfall between 0 and 1000 mm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const applyPreset = (preset) => {
    setFormData({
      nitrogen: preset.values.nitrogen.toString(),
      phosphorus: preset.values.phosphorus.toString(),
      potassium: preset.values.potassium.toString(),
      temperature: preset.values.temperature.toString(),
      humidity: preset.values.humidity.toString(),
      ph: preset.values.ph.toString(),
      rainfall: preset.values.rainfall.toString(),
      notes: `Applied Preset: ${preset.name}`
    });
    setErrors({});
    setApiError(null);
  };

  const handleReset = () => {
    setFormData({
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      temperature: '',
      humidity: '',
      ph: '',
      rainfall: '',
      notes: ''
    });
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
        notes: formData.notes
      };

      const result = await api.predictCrop(payload);
      
      // Fire confetti celebrate
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setPredictionResult(result);
      setActivePage('crop-result');

    } catch (err) {
      console.error("Prediction error:", err);
      setApiError(err.message || 'Failed to generate prediction from backend ML model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
          <Sprout className="w-3.5 h-3.5" />
          <span>Machine Learning Soil Classification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Crop Recommendation Form
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Enter laboratory soil test results and local meteorological data. 
          The Random Forest algorithm will calculate suitability scores and classify the optimal crop.
        </p>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Quick Sample Presets (Click to Populate):</span>
          </span>
          <span className="text-[11px] text-gray-400">Benchmarked agricultural scenarios</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg bg-surface hover:bg-forest-50 border border-gray-200 hover:border-forest-200 text-xs text-gray-700 hover:text-forest-800 font-medium transition text-left"
            >
              <span className="font-semibold">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 sm:p-8">
        
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Prediction Request Failed</p>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Group 1: Soil Macronutrients */}
          <div>
            <div className="flex items-center space-x-2 pb-2 mb-4 border-b border-gray-100">
              <FlaskConical className="w-4 h-4 text-forest-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                1. Soil Chemical Macronutrients (NPK)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Nitrogen */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nitrogen (N) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    name="nitrogen"
                    value={formData.nitrogen}
                    onChange={handleChange}
                    placeholder="e.g. 90"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.nitrogen ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">kg/ha</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Available nitrogen ratio in soil (0 - 300)</p>
                {errors.nitrogen && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.nitrogen}</p>}
              </div>

              {/* Phosphorus */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phosphorus (P) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    name="phosphorus"
                    value={formData.phosphorus}
                    onChange={handleChange}
                    placeholder="e.g. 42"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.phosphorus ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">kg/ha</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Available phosphorus ratio in soil (0 - 300)</p>
                {errors.phosphorus && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.phosphorus}</p>}
              </div>

              {/* Potassium */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Potassium (K) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    name="potassium"
                    value={formData.potassium}
                    onChange={handleChange}
                    placeholder="e.g. 43"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.potassium ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">kg/ha</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Available potassium ratio in soil (0 - 300)</p>
                {errors.potassium && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.potassium}</p>}
              </div>

            </div>
          </div>

          {/* Group 2: Soil pH & Meteorological Metrics */}
          <div>
            <div className="flex items-center space-x-2 pb-2 mb-4 border-b border-gray-100">
              <CloudRain className="w-4 h-4 text-forest-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                2. Soil Acidity & Climatic Conditions
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Soil pH */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Soil pH Level <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    placeholder="e.g. 6.50"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.ph ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">pH (0-14)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Acidity / Alkalinity level (Optimal: 6.0 - 7.5)</p>
                {errors.ph && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.ph}</p>}
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Temperature <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="e.g. 24.5"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.temperature ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">°C</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Mean atmospheric temperature</p>
                {errors.temperature && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.temperature}</p>}
              </div>

              {/* Humidity */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Relative Humidity <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    placeholder="e.g. 82.0"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.humidity ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">%</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Atmospheric relative humidity</p>
                {errors.humidity && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.humidity}</p>}
              </div>

              {/* Rainfall */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Annual/Seasonal Rainfall <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    placeholder="e.g. 240.0"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition ${
                      errors.rainfall ? 'border-rose-400 bg-rose-50/30' : 'border-gray-300 focus:border-forest-700 focus:ring-1 focus:ring-forest-700'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">mm</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Average precipitation volume</p>
                {errors.rainfall && <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.rainfall}</p>}
              </div>

            </div>
          </div>

          {/* Notes Optional */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Field Location or Plot Notes (Optional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. North Plot - River basin loamy soil testing"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-forest-700"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Values</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 ${
                loading ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Evaluating Machine Learning Model...</span>
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>Predict Optimal Crop Now</span>
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
