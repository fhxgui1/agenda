"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Trash2, CheckCircle2, Edit2, Plus, X, ShieldAlert, Zap, Clock, Activity, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProblemById, createProblem, updateProblem, deleteProblem, markProblemSolved, toggleRequirement } from "@/lib/actions/solvedActions";

interface Requirement {
  id?: number;
  content: string;
  is_completed: boolean;
}

export default function EditCreateProblemPage() {
  const params = useParams();
  const router = useRouter();
  
  const problemId = params.problemId as string;
  const isNew = problemId === "novo";

  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState("Baixa");
  const [difficulty, setDifficulty] = useState("Fácil");
  const [timeLevel, setTimeLevel] = useState("Curto");
  const [complexity, setComplexity] = useState("Simples");
  const [status, setStatus] = useState("Aberto");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [newRequirementText, setNewRequirementText] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Fetch logic
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
          setRequirements(data.requirements || []);
        }
      });
    }
  }, [problemId, isNew]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title) return;

    setIsSaving(true);
    try {
      if (isNew) {
        await createProblem({ title, description, importance, difficulty, time_level: timeLevel, complexity, status, requirements });
        router.push("/solved");
      } else {
        await updateProblem(Number(problemId), { title, description, importance, difficulty, time_level: timeLevel, complexity, status, requirements });
        setIsEditing(false); // Switch to read-only
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Deseja apagar este problema definitivamente?")) {
      await deleteProblem(Number(problemId));
      router.push("/solved");
    }
  };

  const handleCompleteProblem = async () => {
    if (confirm("Marcar problema como Resolvido?")) {
      await markProblemSolved(Number(problemId));
      setStatus("Resolvido");
    }
  };

  // Requirement Handlers
  const addRequirement = () => {
    if (!newRequirementText.trim()) return;
    setRequirements([...requirements, { content: newRequirementText, is_completed: false }]);
    setNewRequirementText("");
  };

  const removeRequirement = (index: number) => {
    const arr = [...requirements];
    arr.splice(index, 1);
    setRequirements(arr);
  };

  const toggleReqLocally = async (index: number) => {
    const arr = [...requirements];
    const req = arr[index];
    req.is_completed = !req.is_completed;
    setRequirements(arr);

    // If we're not actively editing the form, persist immediately.
    if (!isEditing && req.id) {
      await toggleRequirement(req.id, req.is_completed);
    }
  };

  // RENDER: VIEW MODE (Read-only)
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 font-sans">
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center shadow-md z-10 sticky top-0">
          <Link href="/solved" className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition active:scale-95">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div className="flex-1 ml-2 flex space-x-2">
            {status === "Resolvido" && (
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest self-center">
                Resolvido
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {status !== "Resolvido" && (
              <button 
                onClick={handleCompleteProblem}
                className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-full transition active:scale-95 flex items-center justify-center"
                title="Marcar como Resolvido"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition active:scale-95 flex items-center justify-center"
              title="Editar Problema"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 mt-6 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">{title}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center text-zinc-300 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
                <ShieldAlert className="w-4 h-4 mr-2 text-rose-400" />
                <div className="flex flex-col"><span className="text-[10px] text-zinc-500 font-bold uppercase">Importância</span><span className="font-bold">{importance}</span></div>
              </div>
              <div className="flex items-center text-zinc-300 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
                <Activity className="w-4 h-4 mr-2 text-amber-400" />
                <div className="flex flex-col"><span className="text-[10px] text-zinc-500 font-bold uppercase">Dificuldade</span><span className="font-bold">{difficulty}</span></div>
              </div>
              <div className="flex items-center text-zinc-300 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
                <Clock className="w-4 h-4 mr-2 text-blue-400" />
                <div className="flex flex-col"><span className="text-[10px] text-zinc-500 font-bold uppercase">Tempo</span><span className="font-bold">{timeLevel}</span></div>
              </div>
              <div className="flex items-center text-zinc-300 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
                <Zap className="w-4 h-4 mr-2 text-purple-400" />
                <div className="flex flex-col"><span className="text-[10px] text-zinc-500 font-bold uppercase">Complexidade</span><span className="font-bold">{complexity}</span></div>
              </div>
            </div>
          </div>

          {description && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{description}</p>
            </div>
          )}

          {requirements.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-3">O que é preciso para resolver:</h2>
              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer transition">
                    <button type="button" onClick={(e) => { e.preventDefault(); toggleReqLocally(idx); }} className="mt-0.5 text-zinc-400 hover:text-emerald-500 transition">
                      {req.is_completed ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
                    </button>
                    <span className={`text-sm font-medium transition ${req.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {req.content}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER: EDIT MODE (Mutation)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 font-sans">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center shadow-md z-10 sticky top-0">
        <button onClick={() => { if(!isNew) setIsEditing(false); else router.push("/solved"); }} className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition active:scale-95">
          <ChevronLeft className="w-6 h-6 text-zinc-400" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white ml-2 flex-1">
          {isNew ? "Novo Problema" : "Modo de Edição"}
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
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Forneça detalhes e contexto sobre o problema aqui..."
            className="bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:border-emerald-500 transition shadow-sm text-sm"
          />
        </div>

        {/* Requirements Input */}
        <div className="flex flex-col pt-4 border-t border-zinc-800">
          <label className="text-sm font-bold text-white mb-1">O que é preciso para resolvê-lo?</label>
          <p className="text-xs text-zinc-500 mb-4">Adicione uma pequena lista de tarefas ou requisitos para matar o problema.</p>
          
          <div className="flex gap-2 items-center mb-4">
            <input
              type="text"
              value={newRequirementText}
              onChange={(e) => setNewRequirementText(e.target.value)}
              onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
              placeholder="Digite uma tarefa preparatória..."
              className="flex-1 bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-500 transition text-sm"
            />
            <button 
              type="button"
              onClick={addRequirement}
              className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
             {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg pl-3">
                  <div className="flex-1 text-sm font-medium text-zinc-300">
                    {req.content}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="p-2 text-zinc-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
             ))}
             {requirements.length === 0 && (
               <div className="text-zinc-600 text-xs italic">Nenhum requisito cadastrado ainda.</div>
             )}
          </div>
        </div>

        {/* Floating Action Button (Save Form) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950/90 via-zinc-950/80 to-transparent backdrop-blur-sm z-40 border-t border-zinc-800/50">
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center py-4 bg-white text-zinc-950 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-zinc-200 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Aguarde..." : (isNew ? "Criar Problema" : "Salvar Modificações")}
          </button>
        </div>
      </form>

    </div>
  );
}
