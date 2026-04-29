import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Bet } from '../types';

interface ProfitChartProps {
  bets: Bet[];
}

export default function ProfitChart({ bets }: ProfitChartProps) {
  // Sort bets by date and calculate cumulative profit
  const sortedBets = [...bets]
    .filter(b => b.status !== 'PENDING')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativeProfit = 0;
  const chartData = sortedBets.map((bet) => {
    cumulativeProfit += bet.profit;
    return {
      date: new Date(bet.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      profit: parseFloat(cumulativeProfit.toFixed(2)),
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-400 font-medium italic">Dados insuficientes para gerar o gráfico.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#238636" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#238636" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363D" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8B949E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8B949E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#161B22', 
              border: '1px solid #30363D', 
              borderRadius: '6px', 
              boxShadow: 'none',
              color: '#C9D1D9'
            }} 
            itemStyle={{ color: '#C9D1D9' }}
            formatter={(value) => [`R$ ${value}`, 'LUCRO']}
          />
          <Area 
            type="stepAfter" 
            dataKey="profit" 
            stroke="#238636" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorProfit)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
