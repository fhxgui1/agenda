"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Settings, Tag } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
       {/* Header */}
       <div className="px-6 pt-10 pb-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-10 flex items-center justify-between shadow-sm">
         <button onClick={() => router.push('/')} className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex items-center justify-center">
           <ChevronLeft className="w-6 h-6 text-neutral-900 dark:text-white" />
         </button>
         <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
           <Settings className="w-5 h-5 text-neutral-500" /> Configurações
         </h1>
         <div className="w-10"></div> {/* Spacer for centering */}
       </div>

       <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-xl mx-auto space-y-4">
            
            {/* Setting Items */}
            <Link 
              href="/settings/activity-types"
              className="group flex flex-row items-center justify-between bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Áreas de Atuação</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Gerenciar categorias de eventos (Financeiro, Estudos...)</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-neutral-400 rotate-180" />
            </Link>

          </div>
       </div>
    </div>
  );
}
