import { Trash2, AlertCircle, CheckCircle2, MinusCircle, Clock } from 'lucide-react';
import type { Bet, BetStatus } from '../types';
import { cn } from '../lib/utils';

interface BetListProps {
  bets: Bet[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: BetStatus) => void;
}

const statusConfig = {
  WIN: { color: 'text-[#3FB950] bg-[#3FB950]/10', icon: CheckCircle2, label: 'GREEN' },
  LOSS: { color: 'text-[#F85149] bg-[#F85149]/10', icon: AlertCircle, label: 'RED' },
  VOID: { color: 'text-[#8B949E] bg-[#8B949E]/10', icon: MinusCircle, label: 'VOID' },
  PENDING: { color: 'text-amber-500 bg-amber-500/10', icon: Clock, label: 'OPEN' },
};

export default function BetList({ bets, onDelete, onUpdateStatus }: BetListProps) {
  const sortedBets = [...bets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedBets.length === 0) {
    return (
      <div className="glass-card p-12 text-center border-dashed">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-brand-text-dim size-6" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico Vazio</h3>
        <p className="text-brand-text-dim text-xs mt-1">Registre suas operações para começar.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#21262D] border-b border-brand-border">
              <th className="px-5 py-3 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Data / Jogo</th>
              <th className="px-5 py-3 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Esporte / Mercado</th>
              <th className="px-5 py-3 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest text-center">Odd / Stake</th>
              <th className="px-5 py-3 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest text-center">Profit</th>
              <th className="px-5 py-3 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Status</th>
              <th className="px-5 py-3 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {sortedBets.map((bet) => {
              const config = statusConfig[bet.status];
              return (
                <tr key={bet.id} className="hover:bg-white/5 transition-colors font-mono">
                  <td className="px-5 py-3">
                    <p className="text-xs font-bold text-white truncate max-w-[150px]">{bet.event}</p>
                    <p className="text-[10px] text-brand-text-dim mt-0.5">{new Date(bet.date).toLocaleDateString('pt-BR')}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[10px] text-brand-text-dim font-sans">{bet.sport}</p>
                    <p className="text-[10px] font-bold text-brand-accent mt-0.5 uppercase">{bet.market}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <p className="text-[10px] font-bold text-white tracking-widest">{bet.odds.toFixed(2)}</p>
                    <p className="text-[10px] text-brand-text-dim mt-0.5">R${bet.stake.toFixed(0)}</p>
                  </td>
                  <td className={cn("px-5 py-3 text-center font-bold text-xs tracking-tighter", bet.profit >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]')}>
                    {bet.status === 'PENDING' ? '-' : `${bet.profit >= 0 ? '+' : ''}${bet.profit.toFixed(1)}`}
                  </td>
                  <td className="px-5 py-3">
                    <select 
                      value={bet.status}
                      onChange={(e) => onUpdateStatus(bet.id, e.target.value as BetStatus)}
                      className={cn(
                        "appearance-none px-2 py-1 rounded text-[9px] font-bold transition-all border-none cursor-pointer uppercase tracking-tighter",
                        config.color
                      )}
                    >
                      <option value="WIN">GREEN</option>
                      <option value="LOSS">RED</option>
                      <option value="VOID">VOID</option>
                      <option value="PENDING">OPEN</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button 
                      onClick={() => onDelete(bet.id)}
                      className="p-1.5 text-brand-text-dim hover:text-brand-loss transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
