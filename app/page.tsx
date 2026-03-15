"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay, isSameMonth, startOfMonth, endOfMonth, endOfWeek, addMonths, subMonths, eachDayOfInterval, isToday, parseISO, setHours, setMinutes, startOfDay, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, AlignLeft, CalendarDays, X } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import Link from 'next/link';

import { dbService } from "@/lib/services/dbService";
import { Task } from "@/lib/services/types";

// --- Utilities --- //
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Components --- //

// Calendar Component
function Calendar({ selectedDate, onSelect, className }: { selectedDate: Date, onSelect: (d: Date) => void, className?: string }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  
  // Sync if selectedDate changes drastically
  useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className={cn("p-4 bg-white/50 backdrop-blur-xl dark:bg-neutral-900/50 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800", className)}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold capitalize text-neutral-800 dark:text-neutral-100">
          {format(currentMonth, dateFormat, { locale: ptBR })}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs font-semibold text-neutral-500">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          
          return (
            <div key={i} className="flex justify-center items-center aspect-square">
              <button
                onClick={() => onSelect(day)}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                  !isCurrentMonth && "text-neutral-300 dark:text-neutral-700",
                  isCurrentMonth && !isSelected && "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  isSelected && "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900 scale-105",
                  isTodayDate && !isSelected && "border border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                )}
              >
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mobile Left Screen (Selection & Filters)
function MobileLeftScreen({ selectedDate, setSelectedDate, toggleView }: { selectedDate: Date, setSelectedDate: (d: Date) => void, toggleView: () => void }) {
  return (
    <div className="w-full h-full flex flex-col px-6 py-10 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Selecionar dia</h1>
        <Link 
          href="/new-event"
          className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          + Novo Evento
        </Link>
      </div>

      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-neutral-500 ml-1">Data</label>
        <div className="relative group">
          <input 
            type="text" 
            readOnly 
            value={format(selectedDate, 'dd/MM/yyyy')}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 flex-1 text-center py-4 px-5 text-lg font-medium shadow-sm transition-shadow group-hover:shadow-md cursor-pointer outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 dark:focus:ring-white/10 dark:focus:border-white"
          />
          <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      <Calendar selectedDate={selectedDate} onSelect={(d) => {
        setSelectedDate(d);
        // Automatically swiping to the right screen mostly implies changing state to tasks view.
        toggleView();
      }} />

      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {['Filtro A', 'Filtro B', 'Filtro C'].map(filter => (
          <button key={filter} className="flex-shrink-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 w-28 h-28 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3 flex items-center justify-center">
              <Filter className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{filter}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile Right Screen (Timeline)
function MobileRightScreen({ selectedDate, tasks }: { selectedDate: Date, tasks: Task[] }) {
  // Hours from 6 AM to 10 PM
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const dayTasks = tasks.filter(t => isSameDay(t.start, selectedDate));

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden relative">
      <div className="px-6 pt-12 pb-6 flex flex-col bg-[#0a0a0a] z-10 sticky top-0">
        <h1 className="text-4xl font-bold tracking-tight capitalize mb-1">
          {format(selectedDate, "EEEE", { locale: ptBR })}
        </h1>
        <p className="text-neutral-400 text-lg font-medium">{format(selectedDate, "d 'de' MMMM", { locale: ptBR })}</p>
      </div>

      <div className="flex-1 overflow-y-auto relative w-full pb-20">
        <div className="flex flex-col relative w-full mt-2">
          {hours.map(hour => {
            const hourTasks = dayTasks.filter(t => t.start.getHours() === hour);
            return (
              <div key={hour} className="relative min-h-[90px] w-full flex group">
                {/* Timeline Grid Line */}
                <div className="absolute top-[18px] right-0 left-20 h-[1px] bg-neutral-800/60" />
                
                {/* Hour Label */}
                <div className="w-20 flex-shrink-0 pt-[12px] pl-5 z-10">
                  {hourTasks.length === 0 && (
                    <span className="text-[12px] font-medium text-white/50 block tracking-wide">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  )}
                </div>
                
                {/* Tasks Container */}
                <div className="flex-1 flex flex-col pb-6 pr-5 z-20">
                  {hourTasks.map((task, idx) => (
                    <Link 
                      href={`/task/${task.id}`} 
                      key={task.id} 
                      className={cn(
                        "block w-full p-5 rounded-[28px] transition-transform active:scale-[0.98] -ml-12 mb-2 shadow-xl", 
                        "bg-[#e1edff] text-[#1e3a8a] border-none"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold leading-none border-b border-[#1e3a8a]/30 pb-0.5 mb-1 inline-block">
                           {format(task.start, "HH:mm")}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl mb-1">{task.title}</h3>
                      <p className="text-sm opacity-80 leading-tight line-clamp-2">{task.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Task List Section (used in Mobile Right-most screen and Desktop alternative view)
function TaskListSection({ tasks, selectedDate }: { tasks: Task[], selectedDate: Date }) {
  const [period, setPeriod] = useState('Hoje');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');

  const filteredTasks = tasks.filter(task => {
    if (period === 'Hoje' && !isSameDay(task.start, selectedDate)) return false;
    if (period === 'Semana' && (task.start < startOfWeek(selectedDate) || task.start > endOfWeek(selectedDate))) return false;
    if (period === 'Mês' && !isSameMonth(task.start, selectedDate)) return false;
    
    if (priorityFilter !== 'Todas' && task.priority !== priorityFilter) return false;
    if (typeFilter !== 'Todos' && task.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">Lista de Tarefas</h1>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="p-3 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none text-neutral-900 dark:text-white">
          <option value="Hoje">Hoje</option>
          <option value="Semana">Esta Semana</option>
          <option value="Mês">Este Mês</option>
        </select>
        <div className="flex gap-3 md:flex-row">
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="flex-1 p-3 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none text-neutral-900 dark:text-white pointer-events-auto appearance-none">
            <option value="Todas">Prioridade (Todas)</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex-1 p-3 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none text-neutral-900 dark:text-white pointer-events-auto appearance-none">
            <option value="Todos">Tipo (Todos)</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Pessoal">Pessoal</option>
            <option value="Projetos">Projetos</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-20 md:pb-0">
        {filteredTasks.length === 0 ? (
          <p className="text-neutral-500 text-center py-10">Nenhuma tarefa encontrada para este filtro.</p>
        ) : (
          filteredTasks.map(task => (
             <Link href={`/task/${task.id}`} key={task.id} className={cn("p-4 rounded-2xl shadow-sm border transition-all hover:scale-[1.01] active:scale-[0.98]", task.color)}>
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg leading-tight w-3/4">{task.title}</h3>
                   <span className="text-xs bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md font-bold">{task.priority}</span>
                </div>
                <p className="text-sm opacity-90 line-clamp-2">{task.description}</p>
                <div className="mt-3 text-xs font-semibold opacity-70 border-t border-black/10 dark:border-white/10 pt-2 flex justify-between">
                  <span>{format(task.start, "dd/MM/yyyy • HH:mm", { locale: ptBR })}</span>
                  <span>{task.type}</span>
                </div>
             </Link>
          ))
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function SchedulerHome() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Mobile dragging state container. Right is active initially.
  // We'll use Framer Motion for draggable screen container
  const [activeScreen, setActiveScreen] = useState<'left'|'center'|'right'>('center');
  const [desktopView, setDesktopView] = useState<'calendar'|'list'>('calendar');

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(new Date());
    dbService.getEvents().then(setTasks);
  }, []);

  // Desktop view constants
  const DesktopWeekView = () => {
    // Generate week days
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 15 }, (_, i) => i + 7);

    return (
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 rounded-l-3xl shadow-2xl border-l border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="h-20 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-8 justify-between bg-neutral-50/50 dark:bg-neutral-900/20">
           <h2 className="text-2xl font-bold capitalize text-neutral-800 dark:text-neutral-100">
             {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
           </h2>
           <div className="flex bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 p-1">
             <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600">
               <ChevronLeft className="w-5 h-5"/>
             </button>
             <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-sm">
               Hoje
             </button>
             <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-600">
               <ChevronRight className="w-5 h-5"/>
             </button>
           </div>
        </div>

        {/* Week Grid Header */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-950 z-20 w-full pl-16">
            {weekDays.map(day => (
              <div key={day.toISOString()} className={cn("flex-1 px-2 py-4 border-l border-neutral-200 dark:border-neutral-800 text-center flex flex-col items-center", isToday(day) && "bg-neutral-50 dark:bg-neutral-900/50")}>
                <span className="text-xs font-semibold text-neutral-400 capitalize mb-1">{format(day, 'EEE', { locale: ptBR })}</span>
                <button 
                  onClick={() => setSelectedDate(day)} 
                  className={cn("w-10 h-10 flex items-center justify-center rounded-full text-lg font-medium transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800", isSameDay(day, selectedDate) && "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800")}
                >
                  {format(day, 'd')}
                </button>
              </div>
            ))}
          </div>
          
          {/* Grid Body */}
          <div className="flex-1 overflow-y-auto relative w-full flex">
             <div className="w-16 flex-shrink-0 relative border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10">
               {hours.map((hour, idx) => (
                 <span key={hour} className="text-xs font-medium text-neutral-400 -translate-y-1/2 absolute right-2 block" style={{ top: `${idx * 96}px` }}>{hour}:00</span>
               ))}
               <div style={{ height: `${hours.length * 96}px` }} />
             </div>
             <div className="flex-1 flex pl-px relative">
               {/* Horizontal grid lines */}
               <div className="absolute inset-0 pointer-events-none">
                 {hours.map((hour, idx) => (
                   <div key={hour} className="absolute left-0 right-0 border-t border-neutral-200 dark:border-neutral-800 w-full" style={{ top: `${idx * 96}px` }} />
                 ))}
               </div>
               {/* Columns */}
               {weekDays.map(day => (
                 <div key={day.toISOString()} className={cn("flex-1 border-l border-neutral-100 dark:border-neutral-800 relative z-10", isToday(day) && "bg-neutral-50/30 dark:bg-neutral-900/20")}>
                   {tasks.filter(t => isSameDay(t.start, day)).map(task => {
                     const startHour = task.start.getHours();
                     const durationHours = (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60);
                     if (startHour < hours[0] || startHour > hours[hours.length - 1]) return null;
                     
                     const topOffset = ((startHour - hours[0]) * 96) + ((task.start.getMinutes() / 60) * 96);
                     const heightPixels = durationHours * 96;

                     return (
                       <Link 
                         href={`/task/${task.id}`} 
                         key={task.id} 
                         className={cn("absolute left-1 right-1 rounded-xl p-3 border shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md flex flex-col gap-1 overflow-hidden", task.color)}
                         style={{ top: `${topOffset}px`, height: `${heightPixels}px` }}
                       >
                         <h3 className="font-semibold text-sm leading-tight truncate">{task.title}</h3>
                         <p className="text-xs opacity-80 leading-tight line-clamp-2">{task.description}</p>
                       </Link>
                     )
                   })}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isMounted) return null;

  return (
    <>
      {/* ---------- MOBILE VIEW ---------- */}
      <div className="md:hidden w-full h-screen overflow-hidden bg-black relative flex">
        {/* We use a drag container for left/center/right swipe */}
        <motion.div 
          className="flex flex-row w-[300vw] h-full"
          drag="x"
          dragConstraints={{ left: typeof window !== 'undefined' ? window.innerWidth * -2 : -1000, right: 0 }}
          dragElastic={0.05}
          onDragEnd={(e, { offset, velocity }) => {
            const threshold = (typeof window !== 'undefined' ? window.innerWidth : 500) / 3;
            // Swiping right => moving left logically
            if (offset.x > threshold || velocity.x > 500) {
              if (activeScreen === 'right') setActiveScreen('center');
              else if (activeScreen === 'center') setActiveScreen('left');
            } 
            // Swiping left => moving right logically
            else if (offset.x < -threshold || velocity.x < -500) {
              if (activeScreen === 'left') setActiveScreen('center');
              else if (activeScreen === 'center') setActiveScreen('right');
            }
          }}
          animate={{ x: activeScreen === 'left' ? 0 : activeScreen === 'center' ? '-100vw' : '-200vw' }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
        >
          {/* Left Screen: Calendar */}
          <div className="w-screen h-full flex-shrink-0">
            <MobileLeftScreen 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate}
              toggleView={() => setActiveScreen('center')}
            />
          </div>
          {/* Center Screen: Timeline */}
          <div className="w-screen h-full flex-shrink-0">
            <MobileRightScreen 
              selectedDate={selectedDate} 
              tasks={tasks}
            />
          </div>
          {/* Right Screen: Task List */}
          <div className="w-screen h-full flex-shrink-0">
             <TaskListSection tasks={tasks} selectedDate={selectedDate} />
          </div>
        </motion.div>

        {/* Native mobile pagination indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-50">
           <div className={cn("h-1.5 rounded-full transition-all duration-300", activeScreen === 'left' ? "w-6 bg-neutral-900 dark:bg-white" : "w-1.5 bg-neutral-300 dark:bg-neutral-700")} />
           <div className={cn("h-1.5 rounded-full transition-all duration-300", activeScreen === 'center' ? "w-6 bg-neutral-900 dark:bg-white" : "w-1.5 bg-neutral-300 dark:bg-neutral-700")} />
           <div className={cn("h-1.5 rounded-full transition-all duration-300", activeScreen === 'right' ? "w-6 bg-neutral-900 dark:bg-white" : "w-1.5 bg-neutral-300 dark:bg-neutral-700")} />
        </div>
      </div>

      {/* ---------- DESKTOP VIEW ---------- */}
      <div className="hidden md:flex w-full h-screen bg-neutral-100 dark:bg-neutral-900 overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 z-10 p-6 overflow-y-auto">
          <div className="mb-8 flex items-center gap-2 text-neutral-900 dark:text-white mt-4">
             <CalendarDays className="w-6 h-6" />
             <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
          </div>
          
          <Link 
            href="/new-event"
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl py-3.5 px-4 font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all active:scale-[0.98] mb-8 flex items-center justify-center gap-2"
          >
            + Nova Tarefa
          </Link>

          <div className="flex bg-neutral-200/50 dark:bg-neutral-800/50 rounded-xl p-1 mb-6">
            <button 
              onClick={() => setDesktopView('calendar')} 
              className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", desktopView === 'calendar' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300')}
            >
              Calendário
            </button>
            <button 
               onClick={() => setDesktopView('list')} 
               className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", desktopView === 'list' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300')}
            >
              Lista
            </button>
          </div>

          <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} className="mb-8 shadow-none border-none bg-transparent dark:bg-transparent" />
          
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4 px-2">Filtros Rápidos</h3>
            <div className="flex flex-col gap-2">
              {['Trabalho', 'Pessoal', 'Projetos'].map(filter => (
                 <button key={filter} className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                   {filter}
                 </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Dashboard Area */}
        {desktopView === 'calendar' ? <DesktopWeekView /> : (
           <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 rounded-l-3xl shadow-2xl border-l border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
              <TaskListSection tasks={tasks} selectedDate={selectedDate} />
           </div>
        )}
      </div>
    </>
  );
}
