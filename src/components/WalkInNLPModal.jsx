import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Terminal, 
  Send, 
  Layers,
  ChefHat,
  Tag
} from 'lucide-react';

export default function WalkInNLPModal() {
  const { parseNLP, placeOrder, setActiveView, simulatedCurrentTime } = useCanteen();

  const [inputText, setInputText] = useState('veg thali no onion and a chai');
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionSuccess, setInjectionSuccess] = useState(null);
  const [showJson, setShowJson] = useState(false);

  // Quick preset sample prompts
  const samplePrompts = [
    'veg thali no onion and a chai',
    '2 samosa extra chutney and cold coffee less sugar',
    'crispy masala dosa without sambar and 2 chai',
    'chole bhature extra butter and pav bhaji',
    'egg curry with 2 parotta extra spicy'
  ];

  const handleParse = async (textToParse = inputText) => {
    setIsParsing(true);
    setInjectionSuccess(null);
    try {
      const res = await parseNLP(textToParse);
      if (res.success) {
        setParsedData(res.result);
      }
    } catch (err) {
      console.error('NLP Parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleInjectToKitchen = async () => {
    if (!parsedData || !parsedData.items || parsedData.items.length === 0) return;

    setIsInjecting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedData.items.map(it => ({
            id: it.id,
            name: it.name,
            price: it.price,
            emoji: it.emoji,
            quantity: it.quantity,
            modifiers: it.modifiers || []
          })),
          studentName: 'Walk-In Student (Voice/Text Input)',
          studentPhone: '+91 98000 00000',
          paymentMethod: 'Cash at Counter',
          notes: `Extracted from NLP: "${inputText}"`,
          source: 'walkin_nlp'
        })
      });
      const data = await res.json();
      if (data.success) {
        setInjectionSuccess(data);
      }
    } catch (err) {
      alert('Error adding order: ' + err.message);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Walk-in Order NLP Terminal</span>
              <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded font-mono border border-purple-500/30">
                Entity Extraction
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Natural language text/voice input concept: Converts free-form speech into structured items, quantities & kitchen modifiers.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Walk-in order (type naturally):</span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              placeholder="e.g. veg thali no onion and a chai..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono transition"
            />
            <button
              onClick={() => handleParse()}
              disabled={isParsing}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-lg shadow-purple-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isParsing ? 'Parsing...' : 'Extract Entities'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Click a sample scenario to test:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(prompt);
                  handleParse(prompt);
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition font-mono"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extraction Results */}
      {parsedData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Extraction Pipeline Breakdown</h3>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">
                Confidence: <strong className="text-emerald-400 font-mono text-sm">{parsedData.confidence}%</strong>
              </span>
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showJson ? 'Hide JSON' : 'View JSON'}</span>
              </button>
            </div>
          </div>

          {/* Structured Items Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Extracted Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recognized Menu Items ({parsedData.items.length})
              </h4>

              {parsedData.items.length === 0 ? (
                <div className="bg-slate-950 p-4 rounded-xl text-xs text-rose-400 border border-rose-900/30">
                  No recognizable menu items found. Please try a different query.
                </div>
              ) : (
                <div className="space-y-2">
                  {parsedData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{item.name}</span>
                            <span className="bg-purple-500/20 text-purple-300 font-mono text-xs px-2 py-0.5 rounded font-bold">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Tag className="w-3 h-3 text-amber-400" />
                              <span className="text-[10px] text-amber-300 font-medium">
                                Modifiers: {item.modifiers.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs text-slate-400 block">₹{item.price} × {item.quantity}</span>
                        <strong className="text-sm text-orange-400">₹{item.lineTotal}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modifiers & Extracted Tokens */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Modifiers & Kitchen Dietary Flags
              </h4>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Detected Modifiers:</span>
                  {parsedData.modifiersDetected && parsedData.modifiersDetected.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {parsedData.modifiersDetected.map((mod, i) => (
                        <span
                          key={i}
                          className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                        >
                          <span>✓</span>
                          <span>{mod}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No specific modifiers requested (standard prep)</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Calculated Order Total:</span>
                  <strong className="text-base text-white">₹{parsedData.totalAmount}</strong>
                </div>
              </div>

              {/* Action Button: Inject Order to Live Kitchen */}
              {parsedData.items.length > 0 && (
                <button
                  onClick={handleInjectToKitchen}
                  disabled={isInjecting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isInjecting ? 'Scheduling Slot & Injecting...' : 'Place Order & Assign Earliest Pickup Slot'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Success Banner if injected */}
          {injectionSuccess && (
            <div className="bg-emerald-950/60 border-2 border-emerald-500/60 rounded-xl p-4 space-y-2 animate-bounce-short">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">
                    Order Injected into Live Pipeline!
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('kitchen')}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded-lg transition"
                >
                  View in Kitchen Hub →
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 text-xs font-mono text-emerald-200 pt-1">
                <div>Assigned Token: <strong className="text-white">{injectionSuccess.order.tokenNumber}</strong></div>
                <div>Pickup Slot: <strong className="text-white">{injectionSuccess.order.pickupSlot}</strong></div>
                <div>Bay: <strong className="text-white">{injectionSuccess.order.counterBay}</strong></div>
              </div>
            </div>
          )}

          {/* JSON Tree Viewer */}
          {showJson && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
