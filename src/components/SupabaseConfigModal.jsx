import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  ExternalLink,
  X,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  testSupabaseConnection,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig
} from '../lib/supabaseClient.js';

export function SupabaseConfigModal({ isOpen, onClose }) {
  const [urlInput, setUrlInput] = useState(supabaseUrl || '');
  const [keyInput, setKeyInput] = useState(supabaseAnonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!urlInput.startsWith('https://')) {
      alert('Please enter a valid Supabase project URL starting with https://');
      return;
    }
    saveCustomSupabaseConfig(urlInput, keyInput);
  };

  const handleResetToDefault = () => {
    clearCustomSupabaseConfig();
  };

  const handleCopySqlInstructions = () => {
    navigator.clipboard.writeText('Run the contents of supabase/schema.sql in your Supabase SQL Editor.');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-white flex items-center gap-2">
                Supabase Backend Configuration
              </h2>
              <p className="text-xs text-slate-400">PostgreSQL Database, Auth & Realtime engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status:</span>
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live Supabase Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Local Resilient Database Engine (Active)
                </span>
              )}
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing || !isSupabaseConfigured}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>

          {testResult && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${testResult.ok ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-rose-950/50 text-rose-300 border border-rose-800'}`}>
              {testResult.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{testResult.ok ? 'Successfully reached Supabase database tables!' : testResult.error}</span>
            </div>
          )}
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Supabase Project URL:
            </label>
            <input
              type="url"
              placeholder="https://your-project-ref.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Supabase Anon Public API Key:
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Setup Guide Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>📋 Setup Instructions:</span>
              <button
                type="button"
                onClick={handleCopySqlInstructions}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSql ? 'Copied' : 'Copy SQL Path'}
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Open your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
              <li>Go to <strong>SQL Editor</strong> $\rightarrow$ New Query, paste content from <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">supabase/schema.sql</code> and click <strong>Run</strong>.</li>
              <li>Go to <strong>Project Settings $\rightarrow$ API</strong>, copy Project URL & Anon Key, paste above and click Save.</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Connect
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs sm:text-sm transition-colors"
            >
              Clear / Use Local Engine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
