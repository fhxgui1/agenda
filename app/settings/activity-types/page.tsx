"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Plus, X } from "lucide-react";
import { fetchActivityTypes, addActivityType } from "@/lib/actions/eventActions";
import { ActivityType } from "@/lib/services/types";

export default function ActivityTypesSettingsPage() {
  const router = useRouter();
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const data = await fetchActivityTypes();
      setTypes(data);
    } catch (error) {
      console.error("Failed to load types", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      // Uses a random color for showcase or could add a color picker
      const colors = ['bg-blue-100 border-blue-200 text-blue-700', 'bg-emerald-100 border-emerald-200 text-emerald-700', 'bg-red-100 border-red-200 text-red-700', 'bg-purple-100 border-purple-200 text-purple-700', 'bg-orange-100 border-orange-200 text-orange-700'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await addActivityType(newTypeName, randomColor);
      setNewTypeName("");
      await loadTypes();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar nova área de atuação. Talvez já exista?");
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
       {/* Header */}
       <div className="px-6 pt-10 pb-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-10 flex items-center justify-between shadow-sm">
         <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex items-center justify-center">
           <ChevronLeft className="w-6 h-6 text-neutral-900 dark:text-white" />
         </button>
         <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Áreas de Atuação</h1>
         <div className="w-10"></div> {/* Spacer for centering */}
       </div>

       <div className="flex-1 overflow-y-auto px-6 py-8">
          <form onSubmit={handleCreate} className="max-w-xl mx-auto mb-8 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
             <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Criar nova Área</h2>
             <div className="flex gap-3">
               <input 
                 type="text"
                 placeholder="Ex: Finanças..."
                 value={newTypeName}
                 onChange={(e) => setNewTypeName(e.target.value)}
                 className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white"
               />
               <button 
                 type="submit"
                 disabled={!newTypeName.trim()}
                 className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center rounded-xl px-4 transition-all"
               >
                 Adicionar
               </button>
             </div>
          </form>

          <div className="max-w-xl mx-auto">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 px-2">Áreas Existentes</h3>
             
             {loading ? (
               <div className="text-center py-8 text-neutral-400">Carregando...</div>
             ) : (
               <div className="space-y-3">
                 {types.map((type) => (
                   <div key={type.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <span className={`w-3 h-3 rounded-full border ${type.colorTheme.split(' ')[0]} ${type.colorTheme.split(' ')[1]}`}></span>
                       <span className="font-semibold text-neutral-800 dark:text-neutral-200">{type.name}</span>
                     </div>
                   </div>
                 ))}
                 
                 {types.length === 0 && (
                   <p className="text-neutral-500 text-sm text-center py-4">Nenhuma área configurada.</p>
                 )}
               </div>
             )}
          </div>
       </div>
    </div>
  );
}
