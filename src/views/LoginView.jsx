import React from 'react';
import { Icon } from '../components/UI';

export const LoginView = ({ profiles, onSelectProfile, onCreateProfile }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 big-tech-bg relative overflow-hidden">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>

            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center z-10 animate-fade-in">
                <div className="text-left space-y-8 md:pr-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-300 tracking-widest uppercase">Sistema Blindado • 100% Offline</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
                        Não apenas sobreviva. <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">Domine</span> o seu dinheiro.
                    </h1>
                    <p className="text-lg text-slate-400 font-medium max-w-lg leading-relaxed border-l-4 border-indigo-500/50 pl-6">
                        A plataforma definitiva para quem busca clareza mental e crescimento patrimonial. <span className="text-white">Sem mensalidades. Sem rastreamento.</span> Apenas você e a sua liberdade.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold"><Icon name="user" size={12}/></div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Junte-se à elite do controle financeiro.</p>
                    </div>
                </div>

                <div className="login-glass rounded-[2rem] p-8 md:p-12 w-full animate-slide-up hover:shadow-indigo-500/10 transition-shadow duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">Bem-vindo de volta.</h2>
                            <p className="text-sm text-slate-400">Escolha seu perfil para acessar o painel.</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-white/5">
                            <Icon name="user" className="text-white" size={24}/>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-72 overflow-y-auto no-scrollbar pr-2 mb-8">
                        {profiles.map(profile => (
                            <button key={profile.id} onClick={() => onSelectProfile(profile.id)} className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner group-hover:scale-105 group-hover:border-indigo-400 transition-all duration-300">
                                        {profile.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-white text-xl group-hover:text-indigo-300 transition-colors">{profile.name}</h3>
                                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase group-hover:text-indigo-400/70">Acessar Conta</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all"><Icon name="right" size={14}/></div>
                            </button>
                        ))}
                        {profiles.length === 0 && <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-700 bg-slate-800/30"><p className="text-slate-400 text-sm">Nenhum perfil encontrado.</p><p className="text-slate-500 text-xs mt-1">Crie o primeiro abaixo.</p></div>}
                    </div>
                    <div className="pt-6 border-t border-white/5">
                        <button onClick={onCreateProfile} className="w-full py-5 rounded-2xl border border-dashed border-slate-600 text-slate-400 font-bold hover:bg-indigo-600 hover:border-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2"><Icon name="plus" className="group-hover:rotate-90 transition-transform duration-300"/> Iniciar Nova Jornada</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-6 text-center w-full z-10 opacity-60"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] hover:text-slate-300 transition-colors cursor-default">ControlCash • Private Edition • v2.0</p></div>
        </div>
    );
};