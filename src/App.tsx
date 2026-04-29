/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, TrendingUp, History, LayoutGrid, Settings, Menu, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StatsCards from './components/StatsCards';
import ProfitChart from './components/ProfitChart';
import BetForm from './components/BetForm';
import BetList from './components/BetList';
import { cn } from './lib/utils';
import type { Bet, Stats, BetStatus } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'analytics' | 'settings'>('dashboard');
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bettrack_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar este app:\n\nNo Android/Chrome: Vá no menu (⋮) > Instalar Aplicativo.\nNo iPhone/Safari: Toque no botão de Compartilhar > Adicionar à Tela de Início.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const stats = useMemo((): Stats => {
    const settledBets = bets.filter(b => b.status !== 'PENDING');
    const totalProfit = settledBets.reduce((acc, bet) => acc + bet.profit, 0);
    const totalStaked = settledBets.reduce((acc, bet) => acc + bet.stake, 0);
    const winCount = settledBets.filter(b => b.status === 'WIN').length;
    const lossCount = settledBets.filter(b => b.status === 'LOSS').length;
    
    return {
      totalProfit,
      totalStaked,
      roi: totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0,
      hitRate: (winCount + lossCount) > 0 ? (winCount / (winCount + lossCount)) * 100 : 0,
      winCount,
      lossCount,
    };
  }, [bets]);

  const addBet = (newBetData: Omit<Bet, 'id' | 'profit'>) => {
    const profit = calculateProfit(newBetData.status, newBetData.stake, newBetData.odds);
    const newBet: Bet = {
      ...newBetData,
      id: crypto.randomUUID(),
      profit,
    };
    setBets(prev => [newBet, ...prev]);
  };

  const updateBetStatus = (id: string, newStatus: BetStatus) => {
    setBets(prev => prev.map(bet => {
      if (bet.id === id) {
        return {
          ...bet,
          status: newStatus,
          profit: calculateProfit(newStatus, bet.stake, bet.odds),
        };
      }
      return bet;
    }));
  };

  const deleteBet = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
      setBets(prev => prev.filter(b => b.id !== id));
    }
  };

  const calculateProfit = (status: BetStatus, stake: number, odds: number) => {
    if (status === 'WIN') return (stake * odds) - stake;
    if (status === 'LOSS') return -stake;
    return 0;
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <StatsCards stats={stats} />
            <section className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Desempenho Profissional</h3>
                  <p className="text-[10px] text-brand-text-dim mt-0.5 font-bold tracking-widest uppercase">Variação acumulada</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-[10px] font-bold rounded uppercase">Dashboard Ativo</span>
                </div>
              </div>
              <ProfitChart bets={bets} />
            </section>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Últimas Entradas</h3>
                <button onClick={() => setCurrentView('history')} className="text-xs font-bold text-brand-accent hover:opacity-80 transition-colors uppercase tracking-widest">Ver Tudo</button>
              </div>
              <BetList bets={bets.slice(0, 5)} onDelete={deleteBet} onUpdateStatus={updateBetStatus} />
            </section>
          </motion.div>
        );
      case 'history':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Histórico Completo</h3>
            <BetList bets={bets} onDelete={deleteBet} onUpdateStatus={updateBetStatus} />
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-sm font-bold text-brand-text-dim mb-4 uppercase tracking-widest">Distribuição por Status</h4>
                <div className="space-y-4">
                  <AnalyticsRow label="Green" count={stats.winCount} total={bets.length} color="bg-[#3FB950]" />
                  <AnalyticsRow label="Red" count={stats.lossCount} total={bets.length} color="bg-[#F85149]" />
                  <AnalyticsRow label="Outros" count={bets.length - stats.winCount - stats.lossCount} total={bets.length} color="bg-slate-500" />
                </div>
              </div>
              <div className="glass-card p-6">
                <h4 className="text-sm font-bold text-brand-text-dim mb-4 uppercase tracking-widest">Métricas de Risco</h4>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between border-b border-brand-border py-2">
                    <span className="text-brand-text-dim">Profit Médio:</span>
                    <span className="text-white">R$ {(stats.totalProfit / (bets.length || 1)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-border py-2">
                    <span className="text-brand-text-dim">Stake Média:</span>
                    <span className="text-white">R$ {(stats.totalStaked / (bets.length || 1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <section className="glass-card p-6">
               <h4 className="text-sm font-bold text-brand-text-dim mb-6 uppercase tracking-widest">Engenharia de Lucro (Detais)</h4>
               <ProfitChart bets={bets} />
            </section>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 max-w-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Configurações de Dados</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-white">Limpeza de Dados</p>
                <p className="text-xs text-brand-text-dim mt-1">Exclua permanentemente todo o seu histórico de apostas.</p>
                <button 
                  onClick={() => { if(confirm('Excluir TUDO? Isso não tem volta.')) setBets([]); }}
                  className="mt-4 px-4 py-2 border border-brand-loss text-brand-loss rounded text-[10px] font-bold uppercase hover:bg-brand-loss/10 transition-all"
                >
                  Limpar Banco de Dados
                </button>
              </div>
              <div className="pt-6 border-t border-brand-border">
                <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-brand-accent p-1 rounded text-[8px]">Novo</span> Instalar no Android
                </p>
                <p className="text-xs text-brand-text-dim mt-2 leading-relaxed">
                  Para baixar o <b>Rodribank</b> no seu smartphone:
                </p>
                <ol className="text-[11px] text-brand-text-dim mt-2 space-y-1 list-decimal ml-4">
                  <li>Abra este site no <b>Google Chrome</b> do celular.</li>
                  <li>Toque nos <b>três pontos (⋮)</b> no canto superior direito.</li>
                  <li>Selecione <b>"Instalar aplicativo"</b> ou <b>"Adicionar à tela inicial"</b>.</li>
                </ol>
                <div className="mt-4 p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-md">
                   <p className="text-[10px] text-brand-accent font-bold">O Rodribank funcionará como um app nativo, com ícone próprio e sem a barra de endereços do navegador.</p>
                </div>
              </div>
              <div className="pt-6 border-t border-brand-border">
                <p className="text-sm font-bold text-white">Sobre o Sistema</p>
                <p className="text-xs text-brand-text-dim mt-1">Rodribank v1.0.0 - Versão Tablet Otimizada.</p>
                <p className="text-[10px] text-brand-accent mt-4">Desenvolvido para traders esportivos profissionais.</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row text-brand-text font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-brand-card border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className="bg-brand-accent p-1.5 rounded-lg">
            <TrendingUp className="text-white size-5" />
          </div>
          <h1 className="text-lg font-serif italic text-white tracking-tight">Rodri<span className="text-brand-accent not-italic font-sans font-bold">bank</span></h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-brand-text-dim hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-brand-bg border-r border-brand-border z-50 md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl font-serif italic text-white">Rodri<span className="text-brand-accent not-italic font-sans font-bold">bank</span></h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-text-dim"><Menu size={24} /></button>
              </div>
              <nav className="p-4 space-y-2">
                <SidebarLink 
                  icon={LayoutGrid} 
                  label="Dashboard" 
                  active={currentView === 'dashboard'} 
                  onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} 
                />
                <SidebarLink 
                  icon={History} 
                  label="Histórico" 
                  active={currentView === 'history'} 
                  onClick={() => { setCurrentView('history'); setIsMobileMenuOpen(false); }} 
                />
                <SidebarLink 
                  icon={TrendingUp} 
                  label="Analítica" 
                  active={currentView === 'analytics'} 
                  onClick={() => { setCurrentView('analytics'); setIsMobileMenuOpen(false); }} 
                />
                <SidebarLink 
                  icon={Settings} 
                  label="Configurações" 
                  active={currentView === 'settings'} 
                  onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }} 
                />
                
                <button 
                  onClick={() => { handleInstallClick(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 mt-4 rounded-md text-xs font-bold text-white bg-brand-accent hover:opacity-90 transition-all uppercase tracking-widest shadow-lg shadow-brand-accent/20"
                >
                  <Smartphone size={18} />
                  Instalar Rodribank
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Optimized for Tablet (md: breakpoint) */}
      <aside className="hidden md:flex w-[220px] bg-brand-bg border-r border-brand-border flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif italic text-white leading-none">
              Rodri<span className="text-brand-accent not-italic font-sans font-bold text-sm vertical-top">bank</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink icon={LayoutGrid} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <SidebarLink icon={History} label="Histórico" active={currentView === 'history'} onClick={() => setCurrentView('history')} />
          <SidebarLink icon={TrendingUp} label="Analítica" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
          <SidebarLink icon={Settings} label="Configurações" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
          
          <div className="pt-4 mt-4 border-t border-brand-border">
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[10px] font-bold text-brand-accent border border-brand-accent/20 bg-brand-accent/5 hover:bg-brand-accent/10 transition-all uppercase tracking-widest"
            >
              <Smartphone size={14} />
              Baixar no Aparelho
            </button>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="border border-dashed border-brand-border rounded-lg p-4">
             <p className="text-[10px] uppercase font-bold text-brand-text-dim tracking-wider">Bankroll Atual</p>
             <p className="font-mono text-xl text-white mt-1">R$ {(stats.totalStaked + stats.totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">{currentView === 'dashboard' ? 'Painel Geral' : currentView.toUpperCase()}</h2>
            <p className="text-brand-text-dim text-xs">Gestão Profissional de Banca Esportiva.</p>
          </div>
          <BetForm onAddBet={addBet} />
        </header>

        {renderView()}
      </main>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active = false, onClick }: { icon: any; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-semibold transition-all group",
      active 
        ? "bg-[#1F242C] text-white" 
        : "text-brand-text-dim hover:bg-white/5 hover:text-white"
    )}>
      <Icon size={18} className={cn(active ? "text-brand-accent" : "text-brand-text-dim group-hover:text-white")} />
      {label}
    </button>
  );
}

function AnalyticsRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold text-brand-text-dim uppercase tracking-wider">
        <span>{label}</span>
        <span>{count} ({percent.toFixed(1)}%)</span>
      </div>
      <div className="h-1.5 w-full bg-[#0D1117] rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

