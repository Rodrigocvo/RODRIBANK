import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import type { Bet, BetStatus } from '../types';
import { cn } from '../lib/utils';

interface BetFormProps {
  onAddBet: (bet: Omit<Bet, 'id' | 'profit'>) => void;
}

export default function BetForm({ onAddBet }: BetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    event: '',
    sport: 'Futebol',
    market: '',
    stake: '',
    odds: '',
    status: 'PENDING' as BetStatus,
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event || !formData.stake || !formData.odds) return;

    onAddBet({
      ...formData,
      stake: parseFloat(formData.stake),
      odds: parseFloat(formData.odds),
      date: formData.date || new Date().toISOString().split('T')[0],
    });

    setFormData({
      event: '',
      sport: 'Futebol',
      market: '',
      stake: '',
      odds: '',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
    });
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-brand-accent hover:opacity-90 text-white px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
      >
        <PlusCircle size={16} />
        Nova Entrada
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-lg w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-brand-border">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Registrar Operação</h2>
              <button onClick={() => setIsOpen(false)} className="text-brand-text-dim hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Evento / Jogo</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Palmeiras x Corinthians"
                  className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all text-xs"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Esporte</label>
                  <select
                    className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all text-xs appearance-none"
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  >
                    <option>Futebol</option>
                    <option>Basquete</option>
                    <option>Tênis</option>
                    <option>E-sports</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Mercado</label>
                  <input
                    placeholder="Match Odds"
                    type="text"
                    className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all text-xs"
                    value={formData.market}
                    onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Investimento</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="R$ 0.00"
                    className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all font-mono text-xs"
                    value={formData.stake}
                    onChange={(e) => setFormData({ ...formData, stake: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Odds (Cotação)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="1.90"
                    className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all font-mono text-xs"
                    value={formData.odds}
                    onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Data</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all text-xs"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Status Inicial</label>
                  <select
                    className="w-full px-3 py-2 rounded border border-brand-border focus:border-brand-accent outline-none transition-all text-xs appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BetStatus })}
                  >
                    <option value="PENDING">Aberto</option>
                    <option value="WIN">Green (V vitória)</option>
                    <option value="LOSS">Red (V derrota)</option>
                    <option value="VOID">Reembolsada</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-accent hover:opacity-90 text-white font-bold py-3 rounded text-xs uppercase tracking-widest transition-all mt-2 active:scale-[0.98]"
              >
                Registrar Operação
              </button>
            </form>
            <div className="p-4 bg-[#0D1117] rounded-b-lg border-t border-brand-border">
              <p className="text-[10px] text-brand-text-dim italic text-center leading-relaxed">
                "Mantenha a gestão de banca em 2-3% por entrada para garantir sobrevivência a longo prazo."
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
