"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProblemById, createProblem, updateProblem, deleteProblem } from "@/lib/actions/solvedActions";

export default function EditCreateProblemPage() {
  const params = useParams();
  const router = useRouter();
  
  const problemId = params.problemId as string;
  const isNew = problemId === "novo";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("Baixa");
  const [difficulty, setDifficulty] = useState("Fácil");
  const [timeLevel, setTimeLevel] = useState("Curto");
  const [complexity, setComplexity] = useState("Simples");
  const [status, setStatus] = useState("Aberto");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNew && problemId) {
      getProblemById(Number(problemId)).then(data => {
        if (data) {
          setTitle(data.title);
          setDescription(data.description || "");
          setImportance(data.importance);
          setDifficulty(data.difficulty);
          setTimeLevel(data.time_level);
          setComplexity(data.complexity);
          setStatus(data.status || "Aberto");
        }
      });
    }
  }, [problemId, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);
    try {
      if (isNew) {
        await createProblem({ title, description, importance, difficulty, time_level: timeLevel, complexity, status });
      } else {
        await updateProblem(Number(problemId), { title, description, importance, difficulty, time_level: timeLevel, complexity, status });
      }
      router.push("/solved");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Deseja apagar este problema definitivamente?")) {
      await deleteProblem(Number(problemId));
      router.push("/solved");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 font-sans">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center shadow-md z-10 sticky top-0">
        <Link href="/solved" className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition active:scale-95">
          <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-white ml-2 flex-1">
          {isNew ? "Novo Problema" : "Editar Problema"}
        </h1>
        
        {!isNew && (
          <button 
            onClick={handleDelete}
            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition active:scale-95"
            title="Excluir Problema"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="px-4 mt-6 space-y-6">
        
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Título do Problema</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Descreva o problema em poucas palavras"
            className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 transition shadow-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none font-semibold text-sm"
            >
              <option value="Aberto">Aberto</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Resolvido">Resolvido</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Importância</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none font-semibold text-sm"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Dificuldade</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none font-semibold text-sm"
            >
              <option value="Fácil">Fácil</option>
              <option value="Moderada">Moderada</option>
              <option value="Difícil">Difícil</option>
              <option value="Extrema">Extrema</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Nível de Tempo</label>
            <select
              value={timeLevel}
              onChange={(e) => setTimeLevel(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none font-semibold text-sm"
            >
              <option value="Rápido">Rápido</option>
              <option value="Médio">Médio</option>
              <option value="Longo">Longo</option>
            </select>
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Complexidade Estrutural</label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none font-semibold text-sm"
            >
              <option value="Simples">Simples (Fácil execução)</option>
              <option value="Moderada">Moderada (Envolve pesquisa)</option>
              <option value="Alta">Alta (Envolve terceiros)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Descrição</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Forneça detalhes maiores sobre este problema aqui..."
            className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 transition shadow-sm text-sm"
          />
        </div>

        {/* Floating Action Button (Save Form) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950/90 via-zinc-950/80 to-transparent backdrop-blur-sm z-40 border-t border-zinc-800/50">
          {status === "Resolvido" && isNew === false ? (
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {isSaving ? "Atualizando..." : "Salvar Progresso (Resolvido)"}
            </button>
          ) : (
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center py-4 bg-white text-zinc-950 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-zinc-200 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? "Salvando..." : (isNew ? "Criar Problema" : "Salvar Modificações")}
            </button>
          )}
        </div>
      </form>

    </div>
  );
}
