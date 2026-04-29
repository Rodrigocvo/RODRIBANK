import { TrendingUp, Target, DollarSign, Activity } from 'lucide-react';
import type { Stats } from '../types';
import { cn } from '../lib/utils';

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'LUCRO LÍQUIDO',
      value: `${stats.totalProfit >= 0 ? '+' : ''}R$ ${stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: stats.totalProfit >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]',
      bgColor: stats.totalProfit >= 0 ? 'bg-[#3FB950]/10' : 'bg-[#F85149]/10',
      description: 'Saldo acumulado',
    },
    {
      title: 'ROI MENSAL',
      value: `${stats.roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-white',
      bgColor: 'bg-white/5',
      description: 'Retorno sobre investimento',
    },
    {
      title: 'WIN RATE',
      value: `${stats.hitRate.toFixed(0)}%`,
      icon: Target,
      color: 'text-white',
      bgColor: 'bg-white/5',
      description: 'Taxa de acertos',
    },
    {
      title: 'TOTAL APOSTADO',
      value: `R$ ${stats.totalStaked.toLocaleString('pt-BR')}`,
      icon: Activity,
      color: 'text-brand-text-dim',
      bgColor: 'bg-white/5',
      description: 'Giro total da banca',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="glass-card p-4 transition-all hover:border-brand-text-dim/30">
          <div className="flex flex-col justify-between h-full">
            <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">{card.title}</span>
            <div className="flex items-end justify-between mt-2">
              <h3 className={cn("stat-value text-2xl font-bold font-mono", card.color)}>{card.value}</h3>
              <div className={cn("p-1.5 rounded", card.bgColor)}>
                <card.icon className={cn("size-4", card.color)} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
