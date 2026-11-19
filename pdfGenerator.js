import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateCropReportPDF(predictionData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [27, 94, 32]; // Forest Green #1B5E20
  const secondaryColor = [76, 175, 80]; // Fresh Green #4CAF50
  const darkTextColor = [33, 33, 33];
  const lightBg = [247, 250, 247];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('INTELLIGENT CROP AND FERTILIZER RECOMMENDATION SYSTEM', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 240, 220);
  doc.text('Agricultural Advisory Report Powered by Machine Learning', 14, 23);

  // Metadata block
  doc.setFontSize(8);
  const now = new Date().toLocaleString();
  doc.text(`Generated: ${now}`, 145, 15);
  doc.text(`Advisory ID: #CROP-${predictionData.prediction_id || 'DEMO'}`, 145, 23);

  // Recommendation Card Banner
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 38, 182, 36, 3, 3, 'F');
  doc.setDrawColor(...secondaryColor);
  doc.roundedRect(14, 38, 182, 36, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('RECOMMENDED CROP CLASSIFICATION', 20, 47);

  doc.setFontSize(22);
  doc.setTextColor(27, 94, 32);
  doc.text(predictionData.crop_display_name || predictionData.predicted_crop.toUpperCase(), 20, 58);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const botName = predictionData.crop_profile?.botanical_name || 'Botanical Cultivar';
  doc.text(`Botanical: ${botName}`, 20, 66);

  // Confidence & Model Badge (Right side of card)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkTextColor);
  doc.text('Model Confidence:', 125, 48);
  doc.setFontSize(16);
  doc.setTextColor(...secondaryColor);
  doc.text(`${predictionData.confidence}%`, 125, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Algorithm: ${predictionData.model_name || 'Random Forest Classifier'}`, 125, 64);
  doc.text(`Model Validation Accuracy: ${(predictionData.model_test_accuracy * 100).toFixed(2)}%`, 125, 69);

  // Section 1: Soil & Climatic Parameters Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('1. Soil & Environmental Parameters Analyzed', 14, 84);

  const p = predictionData.input_parameters;
  const tableData = [
    ['Nitrogen (N)', `${p.N} kg/ha`, p.N > 100 ? 'High' : (p.N > 40 ? 'Moderate' : 'Low')],
    ['Phosphorus (P)', `${p.P} kg/ha`, p.P > 80 ? 'High' : (p.P > 30 ? 'Moderate' : 'Low')],
    ['Potassium (K)', `${p.K} kg/ha`, p.K > 100 ? 'High' : (p.K > 35 ? 'Moderate' : 'Low')],
    ['Soil pH', `${p.ph}`, p.ph < 6 ? 'Acidic' : (p.ph > 7.5 ? 'Alkaline' : 'Neutral / Ideal')],
    ['Temperature', `${p.temperature} °C`, 'Atmospheric mean'],
    ['Relative Humidity', `${p.humidity} %`, p.humidity > 70 ? 'High Humidity' : 'Moderate Humidity'],
    ['Rainfall', `${p.rainfall} mm`, p.rainfall > 150 ? 'Heavy Precipitation' : 'Moderate / Dry'],
  ];

  autoTable(doc, {
    startY: 88,
    head: [['Parameter', 'Recorded Value', 'Agronomic Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  // Section 2: Agronomic Profile & Cultivation Guidelines
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('2. Crop Cultivation & Agronomic Guidelines', 14, finalY);

  const profile = predictionData.crop_profile || {};
  const agronomicItems = [
    ['Sowing Season', profile.season || 'Standard Agronomic Cycle'],
    ['Growth Duration', profile.growing_duration || '90 - 150 days'],
    ['Soil Suitability', profile.soil_type || 'Fertile agricultural loam'],
    ['Water Requirement', profile.optimal_rainfall || '600 - 1000 mm'],
    ['Temperature Window', profile.optimal_temp || '20°C - 32°C'],
  ];

  autoTable(doc, {
    startY: finalY + 4,
    body: agronomicItems,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: primaryColor, cellWidth: 45 },
      1: { textColor: darkTextColor }
    },
    margin: { left: 14, right: 14 }
  });

  // Section 3: Agronomic Best Practices
  const tipsY = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Key Recommended Practices:', 14, tipsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  const tips = profile.agronomic_tips || [
    'Adopt proper soil tillage and basal fertilization as per soil test.',
    'Irrigate at critical stages (crown root / flowering / grain formation).',
    'Follow integrated pest and weed management.'
  ];

  let currentTipY = tipsY + 5;
  tips.forEach((tip, idx) => {
    doc.text(`• ${tip}`, 18, currentTipY);
    currentTipY += 5;
  });

  // Footer Disclaimer
  doc.setDrawColor(200, 220, 200);
  doc.line(14, 275, 196, 275);

  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Intelligent Crop and Fertilizer Recommendation System Using Machine Learning', 14, 281);
  doc.text('Disclaimer: AI-generated advisory based on machine learning models and ICAR benchmark data.', 14, 286);

  // Save the PDF
  const cropClean = (predictionData.predicted_crop || 'crop').toLowerCase();
  doc.save(`Crop_Advisory_Report_${cropClean}.pdf`);
}
