"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus, Search, ShieldAlert, Zap, Clock, Activity, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { fetchProblems } from "@/lib/actions/solvedActions";

export default function SolvedDashboard() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    async function load() {
      const data = await fetchProblems();
      setProblems(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = problems.filter(p => p.title.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex flex-col shadow-md z-10 sticky top-0">
        <div className="flex items-center mb-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition active:scale-95">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div className="flex items-center space-x-2 ml-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Solved
            </h1>
          </div>
        </div>
        <p className="text-zinc-400 text-sm">
          Acompanhe, categorize e resolva seus problemas.
        </p>
      </div>

      <div className="px-4 mt-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
          <input 
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar problemas..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition shadow-sm font-semibold"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 animate-pulse">Carregando problemas...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <ShieldAlert className="w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-bold text-lg">Nenhum problema cadastrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => (
              <Link key={p.id} href={`/solved/${p.id}`} className="block">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/50 transition shadow-sm relative overflow-hidden active:scale-[0.98]">
                  {p.status === "Resolvido" && (
                    <div className="absolute top-0 right-0 max-w-24 bg-emerald-500/20 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Resolvido
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-white mb-3 pr-16">{p.title}</h2>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center text-zinc-400 bg-zinc-950/50 px-2 py-1.5 rounded-lg border border-zinc-800/50">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                      <span className="font-semibold">{p.importance}</span>
                    </div>
                    <div className="flex items-center text-zinc-400 bg-zinc-950/50 px-2 py-1.5 rounded-lg border border-zinc-800/50">
                      <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      <span className="font-semibold">{p.difficulty}</span>
                    </div>
                    <div className="flex items-center text-zinc-400 bg-zinc-950/50 px-2 py-1.5 rounded-lg border border-zinc-800/50">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                      <span className="font-semibold">{p.time_level}</span>
                    </div>
                    <div className="flex items-center text-zinc-400 bg-zinc-950/50 px-2 py-1.5 rounded-lg border border-zinc-800/50">
                      <Zap className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                      <span className="font-semibold">{p.complexity}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-40">
        <Link href="/solved/novo" className="w-full flex items-center justify-center py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition active:scale-95">
          <Plus className="w-6 h-6 mr-2" />
          Registrar Problema
        </Link>
      </div>

    </div>
  );
}
