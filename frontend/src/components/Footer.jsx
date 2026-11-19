import React from 'react';
import { Sprout, Heart, ShieldCheck, Cpu, Database, BookOpen } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-100">
          
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm text-forest-800 leading-tight">
                Intelligent Crop & Fertilizer Recommendation System
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Machine learning decision-support system empowering farmers with precise crop classification and science-backed fertilizer advisories.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Random Forest: 99.55%
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                ICAR Benchmarks
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <button onClick={() => setActivePage('landing')} className="hover:text-forest-700 transition">
                  Home / Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('dashboard')} className="hover:text-forest-700 transition">
                  Analytics Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('crop-recommendation')} className="hover:text-forest-700 transition">
                  Crop Recommendation
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('fertilizer')} className="hover:text-forest-700 transition">
                  Fertilizer Formulator
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('history')} className="hover:text-forest-700 transition">
                  Prediction History
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Stack */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Technology Stack</h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                <span>Scikit-Learn (Random Forest & DT)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                <span>Python Flask RESTful Service</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                <span>SQLite Structured Relational DB</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                <span>React.js + Vite + Tailwind CSS</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                <span>Recharts Data Visualizations</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                <span>Client-Side jsPDF Report Engine</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Info */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Academic Project</h4>
            <p className="text-xs text-gray-600 mb-2">
              <strong>Title:</strong> Intelligent Crop and Fertilizer Recommendation System Using Machine Learning
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Developed as a B.Tech Final Year Major Project demonstrating End-to-End AI/ML Engineering & Full-Stack Deployment.
            </p>
            <div className="p-2.5 rounded-lg bg-surface border border-gray-200 text-[11px] text-gray-600 space-y-1">
              <div className="flex items-center space-x-1 text-forest-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Agricultural Dataset</span>
              </div>
              <p className="text-[10px] text-gray-500">2200 empirical soil samples across 22 crops.</p>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Intelligent Crop and Fertilizer Recommendation System Using Machine Learning.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Engineered with passion for smart farming</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
