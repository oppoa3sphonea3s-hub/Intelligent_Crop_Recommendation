import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CropRecommendationPage from './pages/CropRecommendationPage';
import CropResultPage from './pages/CropResultPage';
import FertilizerPage from './pages/FertilizerPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedCropForFertilizer, setSelectedCropForFertilizer] = useState(null);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-gray-800">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage setActivePage={setActivePage} />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage 
            setActivePage={setActivePage} 
            setSelectedCropForFertilizer={setSelectedCropForFertilizer} 
          />
        )}

        {activePage === 'crop-recommendation' && (
          <CropRecommendationPage 
            setActivePage={setActivePage} 
            setPredictionResult={setPredictionResult} 
          />
        )}

        {activePage === 'crop-result' && (
          <CropResultPage 
            predictionResult={predictionResult} 
            setActivePage={setActivePage} 
            setSelectedCropForFertilizer={setSelectedCropForFertilizer} 
          />
        )}

        {activePage === 'fertilizer' && (
          <FertilizerPage 
            selectedCropForFertilizer={selectedCropForFertilizer} 
            setActivePage={setActivePage} 
          />
        )}

        {activePage === 'history' && (
          <HistoryPage 
            setActivePage={setActivePage} 
            setSelectedCropForFertilizer={setSelectedCropForFertilizer} 
          />
        )}
      </main>

      <Footer setActivePage={setActivePage} />
    </div>
  );
}
