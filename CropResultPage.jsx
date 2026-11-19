import React from 'react';
import { 
  Sprout, 
  Sparkles, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Droplet, 
  Thermometer, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Info,
  BarChart2,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { generateCropReportPDF } from '../utils/pdfGenerator';

export default function CropResultPage({ 
  predictionResult, 
  setActivePage, 
  setSelectedCropForFertilizer 
}) {
  if (!predictionResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Sprout className="w-12 h-12 text-forest-700 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">No Prediction Result Available</h2>
        <p className="text-xs text-gray-500">
          Please submit the crop recommendation form first to analyze soil parameters.
        </p>
        <button
          onClick={() => setActivePage('crop-recommendation')}
          className="px-5 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-semibold"
        >
          Go to Recommendation Form
        </button>
      </div>
    );
  }

  const {
    prediction_id,
    predicted_crop,
    crop_display_name,
    confidence,
    model_name,
    model_test_accuracy,
    top_alternatives,
    all_probabilities,
    crop_profile,
    input_parameters
  } = predictionResult;

  const handleDownloadPDF = () => {
    generateCropReportPDF(predictionResult);
  };

  const handleGoToFertilizer = () => {
    if (setSelectedCropForFertilizer) {
      setSelectedCropForFertilizer({
        crop: predicted_crop,
        nitrogen: input_parameters.N,
        phosphorus: input_parameters.P,
        potassium: input_parameters.K,
        ph: input_parameters.ph
      });
    }
    setActivePage('fertilizer');
  };

  // Comparison chart data (Input parameters overview)
  const chartData = [
    { name: 'Nitrogen (N)', value: input_parameters.N, unit: 'kg/ha' },
    { name: 'Phosphorus (P)', value: input_parameters.P, unit: 'kg/ha' },
    { name: 'Potassium (K)', value: input_parameters.K, unit: 'kg/ha' },
    { name: 'Temperature', value: input_parameters.temperature, unit: '°C' },
    { name: 'Humidity', value: input_parameters.humidity, unit: '%' },
    { name: 'Soil pH', value: input_parameters.ph * 10, label: `${input_parameters.ph}`, unit: 'pH (scaled x10)' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => setActivePage('crop-recommendation')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-forest-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Predict Another Crop</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoToFertilizer}
            className="px-4 py-2.5 rounded-xl bg-fresh-50 hover:bg-fresh-100 border border-fresh-200 text-forest-800 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-fresh-600" />
            <span>Formulate Fertilizer for {crop_display_name}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Hero Recommendation Showcase Card */}
      <div className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Crop Image on Left (5 cols) */}
          <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-auto min-h-[280px]">
            <img 
              src={crop_profile?.image_url} 
              alt={crop_display_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/40"></div>
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-forest-800/90 backdrop-blur text-white text-xs font-bold border border-white/20">
                Primary Recommendation
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
              <h2 className="text-2xl font-black">{crop_display_name}</h2>
              <p className="text-xs text-gray-200 italic">{crop_profile?.botanical_name}</p>
            </div>
          </div>

          {/* Right Recommendation Details (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              <div className="hidden lg:flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    {crop_profile?.category || 'Field Crop'}
                  </span>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {crop_display_name}
                  </h2>
                  <p className="text-xs text-gray-500 italic mt-0.5">
                    Botanical: {crop_profile?.botanical_name}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-gray-500 uppercase">Confidence Score</div>
                  <div className="text-3xl font-extrabold text-forest-800">
                    {confidence}%
                  </div>
                </div>
              </div>

              {/* Mobile confidence display */}
              <div className="lg:hidden flex items-center justify-between p-3 rounded-xl bg-forest-50 border border-forest-100">
                <span className="text-xs font-bold text-gray-700">Model Prediction Confidence</span>
                <span className="text-lg font-extrabold text-forest-800">{confidence}%</span>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-gray-100 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-forest-800">
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  <span>Suitability Diagnosis</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {crop_profile?.suitability_summary}
                </p>
              </div>

              {/* Cultivation specs quick grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <Calendar className="w-4 h-4 text-forest-700 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Sowing Season</span>
                  <span className="text-xs font-bold text-gray-900">{crop_profile?.season}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <Droplet className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Water Need</span>
                  <span className="text-xs font-bold text-gray-900 truncate block">{crop_profile?.optimal_rainfall}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <Thermometer className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Optimal Temp</span>
                  <span className="text-xs font-bold text-gray-900">{crop_profile?.optimal_temp}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <Cpu className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-500 block font-medium">Model Used</span>
                  <span className="text-xs font-bold text-gray-900">Random Forest</span>
                </div>
              </div>

            </div>

            {/* Model Provenance Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-2">
              <span>Classified using {model_name}</span>
              <span className="font-semibold text-forest-800">Validation Accuracy: {(model_test_accuracy * 100).toFixed(2)}%</span>
            </div>

          </div>

        </div>
      </div>

      {/* Second Row: Agronomic Practices & Probabilities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Agronomic Best Practices (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <BookOpen className="w-4 h-4 text-forest-700" />
            <h3 className="font-bold text-sm text-gray-900">
              Recommended Agronomic Practices for {crop_display_name}
            </h3>
          </div>

          <div className="space-y-3">
            {crop_profile?.agronomic_tips?.map((tip, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-surface border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {tip}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-gray-500">
            <strong>Optimal Soil Classification:</strong> {crop_profile?.soil_type}
          </div>
        </div>

        {/* Alternative Candidate Crops (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-forest-700" />
              <h3 className="font-bold text-sm text-gray-900">Class Probabilities</h3>
            </div>
            <span className="text-[11px] text-gray-400">Softmax distribution</span>
          </div>

          <div className="space-y-3 pt-1">
            {all_probabilities && all_probabilities.length > 0 ? (
              all_probabilities.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={idx === 0 ? 'text-forest-800 font-bold' : 'text-gray-700'}>
                      {item.crop} {idx === 0 && '★ Primary'}
                    </span>
                    <span className={idx === 0 ? 'text-forest-800 font-bold' : 'text-gray-600'}>
                      {item.prob}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${idx === 0 ? 'bg-forest-700' : 'bg-gray-400'}`}
                      style={{ width: `${Math.max(item.prob, 1)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No alternatives with significant probability.</p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-forest-50 border border-forest-100 text-[11px] text-forest-900">
            The model provides probabilistic ranking. If primary crop is not commercially preferred, consider the secondary alternative above.
          </div>
        </div>

      </div>

      {/* Input Soil Parameters Record Card */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-card space-y-4">
        <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
          Recorded Input Soil & Climatic Parameters
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Nitrogen (N)</span>
            <span className="text-sm font-extrabold text-gray-900">{input_parameters.N}</span>
            <span className="text-[10px] text-gray-400 block">kg/ha</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Phosphorus (P)</span>
            <span className="text-sm font-extrabold text-gray-900">{input_parameters.P}</span>
            <span className="text-[10px] text-gray-400 block">kg/ha</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Potassium (K)</span>
            <span className="text-sm font-extrabold text-gray-900">{input_parameters.K}</span>
            <span className="text-[10px] text-gray-400 block">kg/ha</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Soil pH</span>
            <span className="text-sm font-extrabold text-forest-700">{input_parameters.ph}</span>
            <span className="text-[10px] text-gray-400 block">Acidity scale</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Temperature</span>
            <span className="text-sm font-extrabold text-gray-900">{input_parameters.temperature}</span>
            <span className="text-[10px] text-gray-400 block">°C</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Humidity</span>
            <span className="text-sm font-extrabold text-gray-900">{input_parameters.humidity}</span>
            <span className="text-[10px] text-gray-400 block">%</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-gray-100">
            <span className="text-[10px] text-gray-500 block font-semibold">Rainfall</span>
            <span className="text-sm font-extrabold text-gray-900">{input_parameters.rainfall}</span>
            <span className="text-[10px] text-gray-400 block">mm</span>
          </div>
        </div>
      </div>

    </div>
  );
}
