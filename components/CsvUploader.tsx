
import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';
import { parseCsvWithAi } from '../services/geminiService';
import { Transaction } from '../types';
import { getCategoryColor } from '../constants';

interface Props {
  allCategories: string[];
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
}

const CsvUploader: React.FC<Props> = ({ allCategories, onImport }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'review'>('idle');
  const [pendingTransactions, setPendingTransactions] = useState<Omit<Transaction, 'id'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('idle');
    
    try {
      const text = await file.text();
      const transactions = await parseCsvWithAi(text, allCategories);
      setPendingTransactions(transactions);
      setStatus('review');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    onImport(pendingTransactions);
    setPendingTransactions([]);
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const cancelImport = () => {
    setPendingTransactions([]);
    setStatus('idle');
  };

  if (status === 'review') {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-indigo-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Review Import</h3>
            <p className="text-sm text-slate-500">AI identified {pendingTransactions.length} transactions.</p>
          </div>
          <button onClick={cancelImport} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto mb-6 border border-slate-100 rounded-xl divide-y divide-slate-50">
          {pendingTransactions.map((t, i) => (
            <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: getCategoryColor(t.category) }} 
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{t.description}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{t.date} • {t.category}</div>
                </div>
              </div>
              <div className={`text-sm font-bold ml-4 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={confirmImport}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
          >
            Confirm Import
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={cancelImport}
            className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Automated Smart Import</h3>
          <p className="text-sm text-slate-500">Upload bank files for instant tracking.</p>
        </div>
        <FileText className="w-8 h-8 text-slate-200" />
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3
          ${loading ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
          ${status === 'success' ? 'border-emerald-200 bg-emerald-50/30' : ''}
          ${status === 'error' ? 'border-rose-200 bg-rose-50/30' : ''}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv" 
          className="hidden" 
        />
        
        {loading ? (
          <>
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <div className="text-sm font-medium text-indigo-900">AI is analyzing your statement...</div>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div className="text-sm font-medium text-emerald-900">Imported successfully!</div>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <div className="text-sm font-medium text-rose-900">Failed to read file</div>
          </>
        ) : (
          <>
            <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center">
              <span className="text-indigo-600 font-semibold">Upload Bank CSV</span>
              <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">
                Requirements: Columns for <b>Date</b>, <b>Description</b>, <b>Category</b>, & <b>Amount</b>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CsvUploader;
