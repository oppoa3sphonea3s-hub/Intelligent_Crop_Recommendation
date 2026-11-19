import React from 'react';
import { 
  Sprout, 
  Sparkles, 
  TrendingUp, 
  Database, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  CloudRain, 
  Thermometer, 
  Droplet 
} from 'lucide-react';

export default function LandingPage({ setActivePage }) {
  return (
    <div className="space-y-20 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:py-24">
        {/* Background Decorative Gradient & Agricultural Texture */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-50/70 via-surface to-white"></div>
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-fresh-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 -z-10 w-72 h-72 bg-forest-200/30 rounded-full blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-forest-100/80 border border-forest-200/60 text-forest-800 text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-fresh-500 animate-ping"></span>
                <span>Powered by Machine Learning & Agronomic Science</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Smart Farming Starts With <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-800 via-forest-700 to-fresh-600">
                  Smarter Decisions.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Optimize your agricultural yield through AI-driven crop selection and scientific fertilizer formulation. 
                Our system synthesizes real-time soil chemistry (N-P-K-pH) and climatic metrics using Random Forest classifiers trained on genuine empirical datasets.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActivePage('crop-recommendation')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Get Started — Predict Crop</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActivePage('fertilizer')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-fresh-600" />
                  <span>Fertilizer Advisor</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-forest-800">99.55%</div>
                  <div className="text-xs text-gray-500 font-medium">Model Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-forest-800">22 Crops</div>
                  <div className="text-xs text-gray-500 font-medium">Empirical Catalog</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-forest-800">7 Parameters</div>
                  <div className="text-xs text-gray-500 font-medium">Soil & Climate Input</div>
                </div>
              </div>

            </div>

            {/* Hero Right: Modern Agricultural Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Card with Real Agricultural Imagery */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white group">
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80" 
                      alt="Modern Precision Agriculture Smart Farm" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-fresh-300">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Real-time Field Soil Diagnostics</span>
                      </div>
                      <h3 className="text-lg font-bold">Intelligent Recommendation Engine</h3>
                      <p className="text-xs text-gray-200">Balanced Nitrogen, Phosphorus, Potassium & pH Analysis</p>
                    </div>
                  </div>

                  {/* Micro dashboard card preview */}
                  <div className="p-5 space-y-3 bg-white">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600 pb-2 border-b border-gray-100">
                      <span>Soil Nutrient Telemetry</span>
                      <span className="text-forest-700 bg-forest-50 px-2 py-0.5 rounded">Optimal Balance</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-surface border border-gray-100">
                        <span className="text-[10px] text-gray-500 block font-medium">N (Nitrogen)</span>
                        <span className="text-xs font-bold text-gray-900">90 kg/ha</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface border border-gray-100">
                        <span className="text-[10px] text-gray-500 block font-medium">P (Phosphorus)</span>
                        <span className="text-xs font-bold text-gray-900">42 kg/ha</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface border border-gray-100">
                        <span className="text-[10px] text-gray-500 block font-medium">K (Potassium)</span>
                        <span className="text-xs font-bold text-gray-900">43 kg/ha</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface border border-gray-100">
                        <span className="text-[10px] text-gray-500 block font-medium">Soil pH</span>
                        <span className="text-xs font-bold text-forest-700">6.50</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-forest-800 font-bold text-xs">
                          ✓
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-gray-900 block">Classified Crop: Paddy / Rice</span>
                          <span className="text-gray-500 text-[10px]">Predicted with 98.4% Confidence</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActivePage('dashboard')}
                        className="text-xs text-forest-800 font-semibold hover:underline"
                      >
                        View Details →
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            Intelligent Features
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
            Everything Required For Precision Crop Science
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            Designed for agriculturalists, agronomy students, and modern farmers to replace guesswork with data-driven machine learning models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-subtle hover:shadow-card hover:-translate-y-1 transition duration-200">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center mb-5">
              <Cpu className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Random Forest Classification</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Trained on 2,200 empirical soil samples across 22 crops. Delivers 99.55% test accuracy with true probabilistic confidence scoring and feature importance rankings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-subtle hover:shadow-card hover:-translate-y-1 transition duration-200">
            <div className="w-12 h-12 rounded-xl bg-fresh-50 text-fresh-700 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Agronomic Fertilizer Engine</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Calculates exact N-P-K nutrient deficits against ICAR benchmark requirements for the target crop. Prescribes Urea, DAP, MOP, SSP, or complexes with exact dosages.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-subtle hover:shadow-card hover:-translate-y-1 transition duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant PDF Advisory Export</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Generates comprehensive, publication-ready agricultural advisory PDF reports containing soil parameter telemetry, cultivation calendars, and management tips.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-forest-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-fresh-300 uppercase tracking-wider bg-forest-800/80 px-3 py-1 rounded-full border border-forest-700">
              Workflow Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">
              How The Recommendation System Works
            </h2>
            <p className="text-sm text-gray-300 mt-3">
              A transparent 4-stage pipeline connecting field parameters to verified machine learning inference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-5 rounded-xl bg-forest-800/60 border border-forest-700/50 space-y-3 relative">
              <div className="w-9 h-9 rounded-lg bg-fresh-500 text-forest-950 font-black flex items-center justify-center text-sm">
                01
              </div>
              <h4 className="font-bold text-base text-white">Input Soil Telemetry</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Provide Nitrogen, Phosphorus, Potassium, Temperature, Humidity, Soil pH, and Rainfall metrics.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl bg-forest-800/60 border border-forest-700/50 space-y-3 relative">
              <div className="w-9 h-9 rounded-lg bg-fresh-500 text-forest-950 font-black flex items-center justify-center text-sm">
                02
              </div>
              <h4 className="font-bold text-base text-white">Random Forest Inference</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                100 decision trees evaluate non-linear multi-dimensional boundaries to predict the highest yielding crop.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl bg-forest-800/60 border border-forest-700/50 space-y-3 relative">
              <div className="w-9 h-9 rounded-lg bg-fresh-500 text-forest-950 font-black flex items-center justify-center text-sm">
                03
              </div>
              <h4 className="font-bold text-base text-white">Nutrient Gap Diagnostics</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                System matches current soil nutrient status with benchmark requirements to formulate corrective fertilizers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-xl bg-forest-800/60 border border-forest-700/50 space-y-3 relative">
              <div className="w-9 h-9 rounded-lg bg-fresh-500 text-forest-950 font-black flex items-center justify-center text-sm">
                04
              </div>
              <h4 className="font-bold text-base text-white">Advisory & Persistence</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Review cultivation guide, download PDF report, and automatically preserve record in SQLite database.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Measurable Agricultural Benefits
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bridging the Gap Between Agronomy and Computational Intelligence
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Traditional farming often relies on historical tradition or trial-and-error fertilizer applications, causing soil degradation, fertilizer runoff, and suboptimal economic yields.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Prevents Fertilizer Over-Application</h4>
                  <p className="text-xs text-gray-600">Calculates precise nitrogen and phosphate dosages to prevent soil toxicity and cut farming overhead costs.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Climate Resilience & Risk Mitigation</h4>
                  <p className="text-xs text-gray-600">Recommends drought-tolerant or flood-tolerant crops based on localized rainfall and humidity inputs.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-fresh-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Soil pH Balancing & Remediation</h4>
                  <p className="text-xs text-gray-600">Prescribes agricultural lime for acidic soils and gypsum/sulfur for alkaline soils to optimize nutrient uptake.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActivePage('dashboard')}
                className="px-6 py-3 rounded-xl bg-forest-800 text-white font-semibold text-xs tracking-wide hover:bg-forest-900 transition shadow-sm"
              >
                Explore Live Analytics Dashboard →
              </button>
            </div>
          </div>

          {/* Right Comparison Visual Card */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-card space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Model Comparison Benchmark</span>
              <span className="text-xs text-forest-700 font-semibold">Test Evaluation</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-700">Random Forest Classifier (Ensemble)</span>
                  <span className="text-forest-800">99.55%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-forest-700 to-fresh-500 h-full rounded-full" style={{ width: '99.55%' }}></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">100 estimators, bagging variance reduction, optimal multi-class performance.</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-700">Decision Tree Classifier</span>
                  <span className="text-gray-800">99.09%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '99.09%' }}></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Single tree with entropy criterion and max depth 15.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-forest-50 border border-forest-100 text-xs text-forest-900 flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-forest-700 shrink-0" />
              <span>Random Forest selected as production inference engine due to superior generalization and zero overfit risk.</span>
            </div>
          </div>

        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Test Soil Telemetry with Real Machine Learning?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Run instant predictions with custom values or preloaded agricultural presets like Rice, Cotton, Chickpea, and Coffee.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setActivePage('crop-recommendation')}
                className="px-6 py-3 rounded-xl bg-fresh-500 hover:bg-fresh-400 text-forest-950 font-bold text-xs shadow-md transition"
              >
                Launch Crop Recommendation Form
              </button>
              <button
                onClick={() => setActivePage('fertilizer')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
              >
                Fertilizer Advisor
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
