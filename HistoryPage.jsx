import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Sprout, 
  AlertCircle, 
  X, 
  Database,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function HistoryPage({ setActivePage, setSelectedCropForFertilizer }) {
  const [activeTab, setActiveTab] = useState('crop'); // 'crop' or 'fertilizer'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistory(activeTab, search);
      setRecords(data || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setError("Failed to load history records from SQLite database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab, search]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this historical record?")) return;

    try {
      await api.deleteHistory(id, activeTab);
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) {
        setDetailModalOpen(false);
      }
    } catch (err) {
      alert("Error deleting record: " + err.message);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeTab === 'crop') {
      csvContent += "ID,Date,Predicted Crop,Confidence (%),Nitrogen,Phosphorus,Potassium,Temperature,Humidity,pH,Rainfall,Model\n";
      records.forEach(r => {
        csvContent += `${r.id},"${r.created_at}","${r.predicted_crop}",${r.confidence},${r.nitrogen},${r.phosphorus},${r.potassium},${r.temperature},${r.humidity},${r.ph},${r.rainfall},"${r.model_used}"\n`;
      });
    } else {
      csvContent += "ID,Date,Crop,Nitrogen,Phosphorus,Potassium,pH,pH Action,Dosage Summary\n";
      records.forEach(r => {
        csvContent += `${r.id},"${r.created_at}","${r.crop_name}",${r.nitrogen},${r.phosphorus},${r.potassium},${r.ph},"${r.ph_action}","${r.dosage_summary}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agrismart_${activeTab}_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Database Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Prediction History & Records
          </h1>
          <p className="text-xs text-gray-500">
            Browse and inspect previous agricultural predictions and fertilizer advisories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
            title="Refresh database records"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCSV}
            disabled={records.length === 0}
            className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-subtle">
        
        {/* Tabs */}
        <div className="flex items-center space-x-1 w-full sm:w-auto bg-surface p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => { setActiveTab('crop'); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'crop' ? 'bg-white text-forest-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Crop Predictions</span>
          </button>

          <button
            onClick={() => { setActiveTab('fertilizer'); setSearch(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'fertilizer' ? 'bg-white text-forest-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fertilizer Advisories</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'crop' ? 'crops or notes...' : 'crops or fertilizers...'}`}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-forest-700 bg-white"
          />
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RotateCcw className="w-6 h-6 text-forest-700 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Querying SQLite records...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-600">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Clock className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700">No Historical Records Found</h3>
            <p className="text-xs text-gray-400">
              Run a crop or fertilizer recommendation to generate new database entries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-surface text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4"># ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  {activeTab === 'crop' ? (
                    <>
                      <th className="py-3 px-4">Predicted Crop</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">N - P - K</th>
                      <th className="py-3 px-4">pH</th>
                      <th className="py-3 px-4">Rainfall</th>
                      <th className="py-3 px-4">Model</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Target Crop</th>
                      <th className="py-3 px-4">N - P - K</th>
                      <th className="py-3 px-4">pH</th>
                      <th className="py-3 px-4">pH Action</th>
                      <th className="py-3 px-4">Prescribed Fertilizers</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {records.map((r) => (
                  <tr 
                    key={r.id} 
                    onClick={() => { setSelectedRecord(r); setDetailModalOpen(true); }}
                    className="hover:bg-forest-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 text-gray-400 font-mono">#{r.id}</td>
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{r.created_at}</td>
                    
                    {activeTab === 'crop' ? (
                      <>
                        <td className="py-3.5 px-4 font-bold text-forest-900">{r.predicted_crop}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {r.confidence}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">{r.nitrogen} - {r.phosphorus} - {r.potassium}</td>
                        <td className="py-3.5 px-4 text-gray-700">{r.ph}</td>
                        <td className="py-3.5 px-4 text-gray-700">{r.rainfall} mm</td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px] truncate max-w-[120px]">{r.model_used}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4 font-bold text-forest-900">{r.crop_name}</td>
                        <td className="py-3.5 px-4 text-gray-700">{r.nitrogen} - {r.phosphorus} - {r.potassium}</td>
                        <td className="py-3.5 px-4 text-gray-700">{r.ph}</td>
                        <td className="py-3.5 px-4 text-gray-600 truncate max-w-[150px]">{r.ph_action}</td>
                        <td className="py-3.5 px-4 text-gray-700 truncate max-w-[200px]">{r.dosage_summary}</td>
                      </>
                    )}

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedRecord(r); setDetailModalOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-forest-800 hover:bg-forest-50 transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* DETAIL INSPECTION MODAL */}
      {detailModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center">
                  {activeTab === 'crop' ? <Sprout className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {activeTab === 'crop' ? `Crop Record #${selectedRecord.id}` : `Fertilizer Record #${selectedRecord.id}`}
                  </h3>
                  <span className="text-[11px] text-gray-400">{selectedRecord.created_at}</span>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'crop' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50 border border-forest-100">
                  <div>
                    <span className="text-[10px] text-forest-700 font-bold uppercase">Predicted Crop</span>
                    <h4 className="text-xl font-black text-forest-900">{selectedRecord.predicted_crop}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-semibold block">Confidence</span>
                    <span className="text-lg font-extrabold text-forest-800">{selectedRecord.confidence}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-surface border border-gray-100">
                    <span className="text-[10px] text-gray-500 block">N</span>
                    <span className="text-xs font-bold">{selectedRecord.nitrogen} kg/ha</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-gray-100">
                    <span className="text-[10px] text-gray-500 block">P</span>
                    <span className="text-xs font-bold">{selectedRecord.phosphorus} kg/ha</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-gray-100">
                    <span className="text-[10px] text-gray-500 block">K</span>
                    <span className="text-xs font-bold">{selectedRecord.potassium} kg/ha</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-gray-100">
                    <span className="text-[10px] text-gray-500 block">pH</span>
                    <span className="text-xs font-bold">{selectedRecord.ph}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-gray-100">
                    <span className="text-[10px] text-gray-500 block">Temperature</span>
                    <span className="text-xs font-bold">{selectedRecord.temperature} °C</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-gray-100">
                    <span className="text-[10px] text-gray-500 block">Rainfall</span>
                    <span className="text-xs font-bold">{selectedRecord.rainfall} mm</span>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <strong>Notes:</strong> {selectedRecord.notes}
                  </div>
                )}

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      if (setSelectedCropForFertilizer) {
                        setSelectedCropForFertilizer({
                          crop: selectedRecord.predicted_crop,
                          nitrogen: selectedRecord.nitrogen,
                          phosphorus: selectedRecord.phosphorus,
                          potassium: selectedRecord.potassium,
                          ph: selectedRecord.ph
                        });
                      }
                      setDetailModalOpen(false);
                      setActivePage('fertilizer');
                    }}
                    className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition"
                  >
                    Formulate Fertilizer for this Record →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-fresh-50 border border-fresh-100">
                  <span className="text-[10px] font-bold text-forest-800 uppercase">Crop Formulated</span>
                  <h4 className="text-lg font-black text-forest-900">{selectedRecord.crop_name}</h4>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-gray-100 space-y-1">
                  <strong>pH Remediation Action:</strong>
                  <p className="text-gray-600">{selectedRecord.ph_action}</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-gray-100 space-y-1">
                  <strong>Dosage Regimen:</strong>
                  <p className="text-gray-600">{selectedRecord.dosage_summary}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
