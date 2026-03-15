"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, CheckCircle2, MoreVertical, Edit2, Loader2, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchEventById, updateEventStatus, toggleEventStep } from "@/lib/actions/eventActions";
import { Task } from "@/lib/services/types";

// Helper for type
export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchEventById(id)
        .then(data => {
          setTask(data);
        })
        .catch(err => {
          console.error("Failed to load task:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleToggleStep = async (stepId: string | number, currentDone: boolean) => {
    if (!task) return;
    try {
      const newDone = !currentDone;
      // Optimistic update
      setTask({
        ...task,
        steps: task.steps?.map(s => s.id === stepId ? { ...s, done: newDone } : s)
      });
      await toggleEventStep(stepId, newDone);
    } catch (e) {
      console.error("Failed to toggle step:", e);
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    try {
      const newStatus = task.status === 'Concluído' ? 'Pendente' : 'Concluído';
      setTask({ ...task, status: newStatus });
      await updateEventStatus(task.id, newStatus);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Evento não encontrado</h1>
        <p className="text-neutral-500 mb-6">Aquele evento pode ter sido removido ou não existe.</p>
        <button onClick={() => router.push('/')} className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium shadow-md">Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center">
       {/* Background decorative header */}
       <div className="w-full h-48 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 absolute top-0 left-0 z-0 opacity-80" />

       <div className="w-full max-w-2xl flex-1 relative z-10 p-4 md:p-8 flex flex-col pb-20">
         {/* Navbar */}
         <div className="flex items-center justify-between mt-4 mb-8 text-white">
           <button onClick={() => router.back()} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors w-10 h-10 flex items-center justify-center">
             <ChevronLeft className="w-6 h-6" />
           </button>
           <div className="flex gap-2">
             <button onClick={handleCompleteTask} className={`px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors font-medium flex items-center gap-2 ${task.status === 'Concluído' ? 'text-green-300' : 'text-white'}`}>
               <Check className="w-5 h-5" />
               {task.status === 'Concluído' ? 'Concluído' : 'Completar'}
             </button>
             <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors w-10 h-10 flex items-center justify-center">
               <Edit2 className="w-5 h-5" />
             </button>
           </div>
         </div>

         {/* Main Card */}
         <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl w-full p-6 md:p-10 mb-6 border border-neutral-100 dark:border-neutral-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold mb-6 uppercase tracking-wider">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               {task.status}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-8">
              {task.title}
            </h1>

            <div className="space-y-6">
               <div className="flex items-start gap-4 text-neutral-700 dark:text-neutral-300">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mt-1 flex-shrink-0">
                     <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Data e Hora</h3>
                    <p className="mt-1">{format(task.start, "EEEE, d 'de' MMMM, yyyy", { locale: ptBR })}</p>
                    <p className="opacity-80 mt-0.5">{format(task.start, "HH:mm")} - {format(task.end, "HH:mm")}</p>
                  </div>
               </div>

               <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800/50" />

               <div className="flex items-start gap-4 text-neutral-700 dark:text-neutral-300">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 mt-1 flex-shrink-0">
                     <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Local</h3>
                    <p className="mt-1">{task.location}</p>
                    <button className="mt-2 text-blue-500 font-medium hover:underline text-sm">Ver no mapa</button>
                  </div>
               </div>

               <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800/50" />

               <div className="flex items-start gap-4 text-neutral-700 dark:text-neutral-300">
                   <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mt-1 flex-shrink-0">
                     <AlignLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Descrição</h3>
                    <p className="mt-1 leading-relaxed opacity-90">{task.description}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Steps Card */}
         <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-6 md:p-10">
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-indigo-500" />
              Etapas / Checklist
            </h3>

            <div className="space-y-4">
               {task.steps?.map(step => (
                 <label key={step.id} className="flex flex-row items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="relative flex items-center justify-center overflow-hidden">
                       <input 
                         type="checkbox" 
                         checked={step.done}
                         onChange={() => handleToggleStep(step.id, step.done)}
                         className="peer appearance-none w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 rounded-md checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
                       />
                       <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                     </div>
                     <span className={`font-medium transition-all ${step.done ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-700 dark:text-neutral-200'}`}>
                       {step.text}
                     </span>
                   </div>
                   <button className="text-neutral-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                     <MoreVertical className="w-5 h-5" />
                   </button>
                 </label>
               ))}
            </div>
         </div>

       </div>
    </div>
  );
}
