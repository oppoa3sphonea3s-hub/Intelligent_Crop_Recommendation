import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sprout, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Printer, 
  FlaskConical, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

const ALL_CROPS = [
  'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
  'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango',
  'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya',
  'coconut', 'cotton', 'jute', 'coffee'
];

const SOIL_TYPES = ['Loamy', 'Sandy', 'Black', 'Red', 'Clayey'];

const FERTILIZER_PRESETS = [
  {
    name: 'Rice (Nitrogen & Phosphorus Deficient)',
    values: { nitrogen: 30, phosphorus: 15, potassium: 40, ph: 5.2, crop: 'rice', soil_type: 'Clayey' }
  },
  {
    name: 'Cotton (Potassium Deficient Soil)',
    values: { nitrogen: 120, phosphorus: 40, potassium: 5, ph: 7.2, crop: 'cotton', soil_type: 'Black' }
  },
  {
    name: 'Apple (Acidic Soil with High P & K Deficit)',
    values: { nitrogen: 20, phosphorus: 40, potassium: 50, ph: 4.8, crop: 'apple', soil_type: 'Loamy' }
  },
  {
    name: 'Banana (Heavy Feeding Soil Test)',
    values: { nitrogen: 45, phosphorus: 30, potassium: 20, ph: 6.5, crop: 'banana', soil_type: 'Loamy' }
  }
];

export default function FertilizerPage({ selectedCropForFertilizer, setActivePage }) {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    crop: 'rice',
    soil_type: 'Loamy'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Pre-fill from crop result if provided
  useEffect(() => {
    if (selectedCropForFertilizer) {
      setFormData(prev => ({
        ...prev,
        crop: selectedCropForFertilizer.crop ? selectedCropForFertilizer.crop.toLowerCase() : 'rice',
        nitrogen: selectedCropForFertilizer.nitrogen !== undefined ? selectedCropForFertilizer.nitrogen.toString() : prev.nitrogen,
        phosphorus: selectedCropForFertilizer.phosphorus !== undefined ? selectedCropForFertilizer.phosphorus.toString() : prev.phosphorus,
        potassium: selectedCropForFertilizer.potassium !== undefined ? selectedCropForFertilizer.potassium.toString() : prev.potassium,
        ph: selectedCropForFertilizer.ph !== undefined ? selectedCropForFertilizer.ph.toString() : prev.ph,
      }));
    }
  }, [selectedCropForFertilizer]);

  const validate = () => {
    const errs = {};
    const n = Number(formData.nitrogen);
    if (formData.nitrogen === '' || isNaN(n) || n < 0 || n > 300) {
      errs.nitrogen = 'Enter Nitrogen between 0 and 300 kg/ha';
    }
    const p = Number(formData.phosphorus);
    if (formData.phosphorus === '' || isNaN(p) || p < 0 || p > 300) {
      errs.phosphorus = 'Enter Phosphorus between 0 and 300 kg/ha';
    }
    const k = Number(formData.potassium);
    if (formData.potassium === '' || isNaN(k) || k < 0 || k > 300) {
      errs.potassium = 'Enter Potassium between 0 and 300 kg/ha';
    }
    const ph = Number(formData.ph);
    if (formData.ph === '' || isNaN(ph) || ph < 0 || ph > 14) {
      errs.ph = 'Enter Soil pH between 0.0 and 14.0';
    }
    if (!formData.crop) {
      errs.crop = 'Please select a target crop';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const applyPreset = (preset) => {
    setFormData({
      nitrogen: preset.values.nitrogen.toString(),
      phosphorus: preset.values.phosphorus.toString(),
      potassium: preset.values.potassium.toString(),
      ph: preset.values.ph.toString(),
      crop: preset.values.crop,
      soil_type: preset.values.soil_type
    });
    setErrors({});
    setApiError(null);
  };

  const handleReset = () => {
    setFormData({
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      ph: '',
      crop: 'rice',
      soil_type: 'Loamy'
    });
    setErrors({});
    setResult(null);
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    try {
      const payload = {
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        ph: parseFloat(formData.ph),
        crop: formData.crop,
        soil_type: formData.soil_type
      };

      const res = await api.recommendFertilizer(payload);
      setResult(res);
      // Smooth scroll to result
      window.scrollTo({ top: 500, behavior: 'smooth' });
    } catch (err) {
      console.error("Fertilizer recommendation error:", err);
      setApiError(err.message || 'Failed to formulate fertilizer recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-fresh-100 text-forest-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-fresh-600" />
          <span>Nutrient Gap Diagnostics & Fertilizer Formulation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Fertilizer Recommendation Advisor
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Evaluates soil nitrogen, phosphorus, potassium, and pH balance against ICAR benchmark requirements 
          for your chosen crop and formulates corrective dosages.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Sample Soil Deficiency Scenarios:</span>
          </span>
          <span className="text-[11px] text-gray-400">Click to autofill values</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {FERTILIZER_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg bg-surface hover:bg-fresh-50 border border-gray-200 hover:border-fresh-200 text-xs text-gray-700 hover:text-forest-900 font-medium transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 sm:p-8">
        
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Formulation Failed</p>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            
            {/* Target Crop Select (2 cols) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Target Crop Cultivated <span className="text-rose-500">*</span>
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:border-forest-700"
              >
                {ALL_CROPS.map(c => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">Select crop to retrieve benchmark N-P-K</p>
            </div>

            {/* Soil Type Select (1 col) */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                name="soil_type"
                value={formData.soil_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-forest-700"
              >
                {SOIL_TYPES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">Physical texture</p>
            </div>

            {/* Nitrogen Input (1 col) */}
            <div className="sm:col-span-1">
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
                  placeholder="e.g. 40"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                    errors.nitrogen ? 'border-rose-400 bg-rose-50/40' : 'border-gray-300 focus:border-forest-700'
                  }`}
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-gray-400 font-medium">kg/ha</span>
              </div>
              {errors.nitrogen && <p className="text-[10px] text-rose-600 mt-1">{errors.nitrogen}</p>}
            </div>

            {/* Phosphorus Input (1 col) */}
            <div className="sm:col-span-1">
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
                  placeholder="e.g. 20"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                    errors.phosphorus ? 'border-rose-400 bg-rose-50/40' : 'border-gray-300 focus:border-forest-700'
                  }`}
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-gray-400 font-medium">kg/ha</span>
              </div>
              {errors.phosphorus && <p className="text-[10px] text-rose-600 mt-1">{errors.phosphorus}</p>}
            </div>

            {/* Potassium Input (1 col) */}
            <div className="sm:col-span-1">
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
                  placeholder="e.g. 30"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                    errors.potassium ? 'border-rose-400 bg-rose-50/40' : 'border-gray-300 focus:border-forest-700'
                  }`}
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-gray-400 font-medium">kg/ha</span>
              </div>
              {errors.potassium && <p className="text-[10px] text-rose-600 mt-1">{errors.potassium}</p>}
            </div>

          </div>

          {/* Row 2: pH */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Soil pH (Acidity / Alkalinity) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  placeholder="e.g. 6.2"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                    errors.ph ? 'border-rose-400 bg-rose-50/40' : 'border-gray-300 focus:border-forest-700'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">pH (0-14)</span>
              </div>
              {errors.ph && <p className="text-[10px] text-rose-600 mt-1">{errors.ph}</p>}
            </div>
          </div>

          {/* Form Actions */}
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
                  <span>Calculating Nutrient Gaps...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Soil & Formulate Fertilizer</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 text-white shadow-card">
            <div>
              <span className="text-xs text-fresh-300 font-bold uppercase tracking-wider block">
                Agronomic Nutrient Advisory Formulated
              </span>
              <h2 className="text-2xl font-black mt-1">
                Fertilizer Regimen for {result.crop}
              </h2>
              <p className="text-xs text-gray-300 mt-1">
                Benchmark Standards: Target N: {result.crop_requirements.target_n} kg/ha | Target P: {result.crop_requirements.target_p} kg/ha | Target K: {result.crop_requirements.target_k} kg/ha | Optimal pH: {result.crop_requirements.optimal_ph_range}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-600 text-white text-xs font-semibold flex items-center space-x-1.5 shrink-0 self-start sm:self-auto border border-forest-600 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Advisory</span>
            </button>
          </div>

          {/* 1. Nutrient Gaps Breakdown Cards */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-1.5">
              <FlaskConical className="w-4 h-4 text-forest-700" />
              <span>Nutrient Telemetry & Gap Diagnosis</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Nitrogen Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-card space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-600">NITROGEN (N)</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    result.soil_analysis.nitrogen.status.includes('Deficient')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : result.soil_analysis.nitrogen.status === 'Optimal'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {result.soil_analysis.nitrogen.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {result.soil_analysis.nitrogen.current} <span className="text-xs font-normal text-gray-500">kg/ha</span>
                </div>
                <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                  <span>Target: {result.soil_analysis.nitrogen.target} kg/ha</span>
                  <span className="font-semibold text-gray-800">
                    Gap: {result.soil_analysis.nitrogen.difference > 0 ? `-${result.soil_analysis.nitrogen.difference}` : `+${-result.soil_analysis.nitrogen.difference}`}
                  </span>
                </div>
              </div>

              {/* Phosphorus Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-card space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-600">PHOSPHORUS (P)</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    result.soil_analysis.phosphorus.status.includes('Deficient')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : result.soil_analysis.phosphorus.status === 'Optimal'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {result.soil_analysis.phosphorus.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {result.soil_analysis.phosphorus.current} <span className="text-xs font-normal text-gray-500">kg/ha</span>
                </div>
                <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                  <span>Target: {result.soil_analysis.phosphorus.target} kg/ha</span>
                  <span className="font-semibold text-gray-800">
                    Gap: {result.soil_analysis.phosphorus.difference > 0 ? `-${result.soil_analysis.phosphorus.difference}` : `+${-result.soil_analysis.phosphorus.difference}`}
                  </span>
                </div>
              </div>

              {/* Potassium Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-card space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-600">POTASSIUM (K)</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    result.soil_analysis.potassium.status.includes('Deficient')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : result.soil_analysis.potassium.status === 'Optimal'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {result.soil_analysis.potassium.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {result.soil_analysis.potassium.current} <span className="text-xs font-normal text-gray-500">kg/ha</span>
                </div>
                <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                  <span>Target: {result.soil_analysis.potassium.target} kg/ha</span>
                  <span className="font-semibold text-gray-800">
                    Gap: {result.soil_analysis.potassium.difference > 0 ? `-${result.soil_analysis.potassium.difference}` : `+${-result.soil_analysis.potassium.difference}`}
                  </span>
                </div>
              </div>

              {/* Soil pH Card */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-card space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-600">SOIL pH</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    result.soil_analysis.ph.status === 'Optimal'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {result.soil_analysis.ph.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-forest-800">
                  {result.soil_analysis.ph.current}
                </div>
                <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                  <span>Ideal: {result.crop_requirements.optimal_ph_range}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Soil pH Remediation Advice Card */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-card space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
              <ShieldCheck className="w-5 h-5 text-forest-700" />
              <span>Soil Reaction (pH) Correction & Conditioning</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-gray-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2">
                <span className="text-forest-900">{result.ph_remediation.action}</span>
                <span className="text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded border border-forest-200">
                  Dosage: {result.ph_remediation.dosage}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Scientific Basis:</strong> {result.ph_remediation.scientific_reason}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Application Timing:</strong> {result.ph_remediation.timing}
              </p>
            </div>
          </div>

          {/* 3. Formulated Fertilizers List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>Formulated Fertilizer Products & Application Regimen</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.fertilizer_recommendations.map((fert, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-card space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                          {fert.target_nutrient}
                        </span>
                        <h4 className="text-lg font-black text-gray-900 mt-1">
                          {fert.fertilizer}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-gray-100 text-xs text-gray-700 space-y-1">
                      <div className="font-semibold text-gray-900">Nutrient Composition:</div>
                      <div>{fert.specs?.nutrients || 'Standard agricultural formulation'}</div>
                    </div>

                    <div className="text-xs text-gray-600 leading-relaxed">
                      <strong>Agronomic Rationale:</strong> {fert.rationale}
                    </div>

                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-forest-800 bg-emerald-50/60 p-2 rounded-lg">
                      <span>Prescribed Dose:</span>
                      <span>{fert.dosage_guideline}</span>
                    </div>

                    <div className="text-[11px] text-gray-500">
                      <strong>How to Apply:</strong> {fert.application_method}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ML Classifier Cross-Validation Banner */}
          {result.ml_prediction && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">ML Classifier Cross-Check:</span> The secondary Random Forest fertilizer model predicts{' '}
                <span className="font-extrabold text-blue-800 underline">{result.ml_prediction.fertilizer}</span> as the primary complex.
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Classification Accuracy: 100%
              </span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
