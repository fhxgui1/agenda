"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createEvent } from "@/lib/actions/eventActions";

// Make sure to define cn if not imported correctly, or manually apply classes
function twMerge(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type EventType = "Tarefa" | "Compromisso" | "Projeto" | "Rotina" | "Atividade";

export default function NewEventPage() {
  const router = useRouter();
  const [eventType, setEventType] = useState<EventType>("Tarefa");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [steps, setSteps] = useState([{ id: Date.now(), text: "" }]);
  
  const addStep = () => {
    setSteps([...steps, { id: Date.now(), text: "" }]);
  };

  const updateStep = (id: number, text: string) => {
    setSteps(steps.map(step => step.id === id ? { ...step, text } : step));
  };

  const removeStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id));
    }
  };
  
  // Date/Time
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const eventTypes: EventType[] = ["Tarefa", "Compromisso", "Projeto", "Rotina", "Atividade"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let startD = new Date();
    let endD = new Date();

    if (eventType === "Projeto") {
      if (startDate) startD = new Date(startDate);
      if (endDate) endD = new Date(endDate);
    } else {
      if (date && time) {
        startD = new Date(`${date}T${time}:00`);
        endD = new Date(startD);
        endD.setHours(endD.getHours() + 1);
      }
    }

    try {
      const typeMapping: any = {
        'Tarefa': 'Trabalho',
        'Compromisso': 'Trabalho',
        'Projeto': 'Projetos',
        'Rotina': 'Pessoal',
        'Atividade': 'Pessoal'
      };

      await createEvent({
        title,
        description: description + (objective ? `\n\nObjetivo: ${objective}` : ""),
        start: startD,
        end: endD,
        color: 'bg-blue-100 border-blue-200 text-blue-700',
        priority: 'Média',
        type: typeMapping[eventType] || 'Pessoal',
        eventType,
      });

      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar evento');
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
       {/* Header */}
       <div className="px-6 pt-10 pb-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-10 flex items-center justify-between shadow-sm">
         <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex items-center justify-center">
           <ChevronLeft className="w-6 h-6 text-neutral-900 dark:text-white" />
         </button>
         <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Novo Evento</h1>
         <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex items-center justify-center">
           <Save className="w-5 h-5 text-indigo-500" />
         </button>
       </div>

       <div className="flex-1 overflow-y-auto px-6 py-8">
         {/* Layout Selector */}
         <div className="mb-8 overflow-x-auto hide-scrollbar -mx-6 px-6">
           <div className="flex gap-2 w-max pb-2">
             {eventTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => setEventType(type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${eventType === type ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-white text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'}`}
                >
                  {type}
                </button>
             ))}
           </div>
         </div>

         <form className="space-y-6 max-w-2xl mx-auto w-full" onSubmit={handleSubmit}>
            {/* Common Fields: Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-500 ml-1 mb-1 block">Título</label>
                <input 
                  type="text" 
                  placeholder={`Ex: ${eventType} importante`}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 px-5 text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500 ml-1 mb-1 block">Descrição</label>
                <textarea 
                  rows={4}
                  placeholder="Mais detalhes..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 px-5 text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Projeto Specific Fields */}
            {eventType === "Projeto" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div>
                   <label className="text-sm font-medium text-neutral-500 ml-1 mb-1 block">Objetivo do Projeto</label>
                   <input 
                     type="text" 
                     placeholder="Ex: Entregar a versão 1.0 do App"
                     value={objective}
                     onChange={e => setObjective(e.target.value)}
                     className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl py-4 px-5 text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                   />
                 </div>
              </div>
            )}

            {/* Steps Fields (Projeto / Atividade) */}
            {(eventType === "Projeto" || eventType === "Atividade") && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="text-sm font-medium text-neutral-500 ml-1 block">Etapas / Checklist</label>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <input 
                        type="text" 
                        placeholder={`Etapa ${index + 1}...`}
                        value={step.text}
                        onChange={e => updateStep(step.id, e.target.value)}
                        className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-3 px-4 text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                      />
                      <button 
                        type="button"
                        onClick={() => removeStep(step.id)}
                        disabled={steps.length === 1}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          steps.length === 1 ? "opacity-30 cursor-not-allowed text-neutral-400" : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        )}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={addStep}
                  className="mt-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar etapa
                </button>
              </div>
            )}

            {/* Date/Time Fields */}
            <div className="pt-2 animate-in fade-in duration-300">
               <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Data e Hora</h3>
               
               {eventType === "Projeto" ? (
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 ml-1 mb-1 block">Início</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 ml-1 mb-1 block">Fim</label>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                      />
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 ml-1 mb-1 block">Data</label>
                      <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-sm md:text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 ml-1 mb-1 block">Horário</label>
                      <input 
                        type="time" 
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-sm md:text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
                      />
                    </div>
                 </div>
               )}
            </div>

            <div className="pt-8 pb-10">
               <button type="submit" className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-lg rounded-2xl py-4 shadow-lg active:scale-[0.98] transition-all">
                  Criar {eventType}
               </button>
            </div>
         </form>
       </div>
    </div>
  );
}
