"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isToday,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  addHours,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Clock,
  MapPin,
  AlignLeft,
  CalendarDays,
  X,
  Settings,
} from "lucide-react"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"
import Link from "next/link"
import { fetchEvents } from "@/lib/actions/eventActions"
import { Task } from "@/lib/services/types"

// --- Utilities --- //
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

function useCurrentTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])
  return now
}

// --- Components --- //

// Calendar Component.

function Calendar({
  selectedDate,
  onSelect,
  className,
}: {
  selectedDate: Date
  onSelect: (d: Date) => void
  className?: string
}) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))

  // Sync if selectedDate changes drastically
  useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDate))
    }
  }, [selectedDate])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "MMMM yyyy"
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]

  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200 bg-white/50 p-4 shadow-sm backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-neutral-800 capitalize dark:text-neutral-100">
          {format(currentMonth, dateFormat, { locale: ptBR })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-semibold text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isTodayDate = isToday(day)

          return (
            <div
              key={i}
              className="flex aspect-square items-center justify-center"
            >
              <button
                onClick={() => onSelect(day)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                  !isCurrentMonth && "text-neutral-300 dark:text-neutral-700",
                  isCurrentMonth &&
                    !isSelected &&
                    "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  isSelected &&
                    "scale-105 bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900",
                  isTodayDate &&
                    !isSelected &&
                    "border border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                )}
              >
                {format(day, "d")}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Mobile Left Screen (Selection & Filters)
function MobileLeftScreen({
  selectedDate,
  setSelectedDate,
  toggleView,
}: {
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  toggleView: () => void
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-neutral-50 px-6 py-10 dark:bg-neutral-950">
      <Link
        href="/settings"
        className="absolute top-10 right-6 z-20 rounded-full border border-neutral-200 bg-white p-2 shadow-sm transition-colors hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <Settings className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
      </Link>

      <div className="mb-8 flex items-center justify-between pr-12">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Selecionar dia
        </h1>
        <Link
          href="/new-event"
          className="hidden rounded-xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 md:flex dark:bg-white dark:text-neutral-900"
        >
          + Novo
        </Link>
      </div>

      <div className="mb-6 space-y-2">
        <label className="ml-1 text-sm font-medium text-neutral-500">
          Data
        </label>
        <div className="group relative">
          <input
            type="text"
            readOnly
            value={format(selectedDate, "dd/MM/yyyy")}
            className="w-full flex-1 cursor-pointer rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-center text-lg font-medium shadow-sm transition-shadow outline-none group-hover:shadow-md focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
          />
          <CalendarIcon className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      <Calendar
        selectedDate={selectedDate}
        onSelect={(d) => {
          setSelectedDate(d)
          // Automatically swiping to the right screen mostly implies changing state to tasks view.
          toggleView()
        }}
      />

      <div className="hide-scrollbar mt-8 flex gap-4 overflow-x-auto pb-4">
        {["Filtro A", "Filtro B", "Filtro C"].map((filter) => (
          <button
            key={filter}
            className="flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Filter className="h-5 w-5 text-neutral-500" />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {filter}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Mobile Right Screen (Timeline)
function MobileRightScreen({
  selectedDate,
  tasks,
}: {
  selectedDate: Date
  tasks: Task[]
}) {
  const now = useCurrentTime()
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayTasks = tasks.filter(
    (t) => isSameDay(t.start, selectedDate) && t.hasTime
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours()
      // Scroll slightly before the current hour (e.g., each hour is approx 90px tall)
      // minus 45px for a centered feel, making sure we don't go negative
      const targetScroll = Math.max(0, currentHour * 90 - 45)
      scrollRef.current.scrollTop = targetScroll
    }
  }, [selectedDate])

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0a0a0a] text-white">
      <div className="sticky top-0 z-10 flex flex-col bg-[#0a0a0a] px-6 pt-12 pb-6">
        <h1 className="mb-1 text-4xl font-bold tracking-tight capitalize">
          {format(selectedDate, "EEEE", { locale: ptBR })}
        </h1>
        <p className="text-lg font-medium text-neutral-400">
          {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="relative w-full flex-1 overflow-y-auto scroll-smooth pb-20"
      >
        <div className="relative mt-2 flex w-full flex-col">
          {hours.map((hour) => {
            const hourTasks = dayTasks.filter(
              (t) => t.start.getHours() === hour
            )
            const isCurrentHour =
              isSameDay(selectedDate, now) && now.getHours() === hour
            const currentMinuteOffset = isCurrentHour
              ? (now.getMinutes() / 60) * 90
              : 0

            return (
              <div
                key={hour}
                className="group relative flex min-h-[90px] w-full"
              >
                {/* Timeline Grid Line */}
                <div className="absolute top-[18px] right-0 left-20 h-[1px] bg-neutral-800/60" />

                {/* Current Time Line */}
                {isCurrentHour && (
                  <div
                    className="pointer-events-none absolute right-0 left-20 z-30 h-[2px] bg-red-500"
                    style={{ top: `${18 + currentMinuteOffset}px` }}
                  >
                    <div className="absolute -top-[5px] -left-1.5 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  </div>
                )}

                {/* Hour Label */}
                <div className="z-10 w-20 flex-shrink-0 pt-[12px] pl-5">
                  {hourTasks.length === 0 && (
                    <span className="block text-[12px] font-medium tracking-wide text-white/50">
                      {hour.toString().padStart(2, "0")}:00
                    </span>
                  )}
                </div>

                {/* Tasks Container */}
                <div className="z-20 flex flex-1 flex-col pr-5 pb-6">
                  {hourTasks.map((task, idx) => (
                    <Link
                      href={`/task/${task.id}`}
                      key={task.id}
                      className={cn(
                        "mb-2 -ml-12 block w-full rounded-[28px] p-5 shadow-xl transition-transform active:scale-[0.98]",
                        "border-none bg-[#e1edff] text-[#1e3a8a]"
                      )}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="mb-1 inline-block border-b border-[#1e3a8a]/30 pb-0.5 text-xs leading-none font-bold">
                          {format(task.start, "HH:mm")}
                        </span>
                      </div>
                      <h3 className="mb-1 text-xl font-bold">{task.title}</h3>
                      <p className="line-clamp-2 text-sm leading-tight opacity-80">
                        {task.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Task List Section (used in Mobile Right-most screen and Desktop alternative view)
function TaskListSection({
  tasks,
  selectedDate,
  showCompleted,
  setShowCompleted,
}: {
  tasks: Task[]
  selectedDate: Date
  showCompleted: boolean
  setShowCompleted: (val: boolean) => void
}) {
  const [period, setPeriod] = useState("Hoje")
  const [priorityFilter, setPriorityFilter] = useState("Todas")
  const [typeFilter, setTypeFilter] = useState("Todos")

  const filteredTasks = tasks.filter((task) => {
    if (period === "Hoje" && !isSameDay(task.start, selectedDate)) return false
    if (
      period === "Semana" &&
      (task.start < startOfWeek(selectedDate) ||
        task.start > endOfWeek(selectedDate))
    )
      return false
    if (period === "Mês" && !isSameMonth(task.start, selectedDate)) return false

    if (priorityFilter !== "Todas" && task.priority !== priorityFilter)
      return false
    if (typeFilter !== "Todos" && task.type !== typeFilter) return false
    return true
  })

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-neutral-50 p-6 md:p-10 dark:bg-neutral-950">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
        Lista de Tarefas
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white p-3 text-sm font-medium text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        >
          <option value="Hoje">Hoje</option>
          <option value="Semana">Esta Semana</option>
          <option value="Mês">Este Mês</option>
        </select>
        <div className="flex gap-3 md:flex-row">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="pointer-events-auto flex-1 appearance-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-medium text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          >
            <option value="Todas">Prioridade (Todas)</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pointer-events-auto flex-1 appearance-none rounded-xl border border-neutral-200 bg-white p-3 text-sm font-medium text-neutral-900 outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          >
            <option value="Todos">Tipo (Todos)</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Pessoal">Pessoal</option>
            <option value="Projetos">Projetos</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="h-4 w-4 rounded text-blue-500"
          />
          Mostrar eventos concluídos
        </label>
      </div>

      <div className="flex flex-col gap-3 pb-20 md:pb-0">
        {filteredTasks.length === 0 ? (
          <p className="py-10 text-center text-neutral-500">
            Nenhuma tarefa encontrada para este filtro.
          </p>
        ) : (
          filteredTasks.map((task) => (
            <Link
              href={`/task/${task.id}`}
              key={task.id}
              className={cn(
                "rounded-2xl border p-4 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98]",
                task.color
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="w-3/4 text-lg leading-tight font-bold">
                  {task.title}
                </h3>
                <span className="rounded-md bg-black/5 px-2 py-1 text-xs font-bold dark:bg-white/10">
                  {task.priority}
                </span>
              </div>
              <p className="line-clamp-2 text-sm opacity-90">
                {task.description}
              </p>
              <div className="mt-3 flex justify-between border-t border-black/10 pt-2 text-xs font-semibold opacity-70 dark:border-white/10">
                <span>
                  {format(task.start, "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                </span>
                <span>{task.type}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

// Main Page Component
export default function SchedulerHome() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCompleted, setShowCompleted] = useState(false)

  // Mobile dragging state container. Right is active initially.
  // We'll use Framer Motion for draggable screen container
  const [activeScreen, setActiveScreen] = useState<"left" | "center" | "right">(
    "center"
  )
  const [desktopView, setDesktopView] = useState<"calendar" | "list">(
    "calendar"
  )

  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => showCompleted || t.status !== "Concluído")
  }, [tasks, showCompleted])

  useEffect(() => {
    setIsMounted(true)
    setSelectedDate(new Date())
    fetchEvents().then(setTasks)
  }, [])

  // Desktop view constants
  const DesktopWeekView = () => {
    const now = useCurrentTime()
    // Generate week days
    const weekStart = startOfWeek(selectedDate)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (scrollRef.current) {
        const currentHour = new Date().getHours()
        // Each hour block is 96px tall, subtract some offset to center it nicely
        const targetScroll = Math.max(0, currentHour * 96 - 50)
        scrollRef.current.scrollTop = targetScroll
      }
    }, [])

    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden rounded-l-3xl border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-neutral-200 bg-neutral-50/50 px-8 dark:border-neutral-800 dark:bg-neutral-900/20">
          <h2 className="text-2xl font-bold text-neutral-800 capitalize dark:text-neutral-100">
            {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex rounded-full border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
            <button
              onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
              className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
              className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Week Grid Header */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-20 flex w-full border-b border-neutral-200 bg-white pl-16 dark:border-neutral-800 dark:bg-neutral-950">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-1 flex-col items-center border-l border-neutral-200 px-2 py-4 text-center dark:border-neutral-800",
                  isToday(day) && "bg-neutral-50 dark:bg-neutral-900/50"
                )}
              >
                <span className="mb-1 text-xs font-semibold text-neutral-400 capitalize">
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <button
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-lg font-medium transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800",
                    isSameDay(day, selectedDate) &&
                      "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                  )}
                >
                  {format(day, "d")}
                </button>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div
            ref={scrollRef}
            className="relative flex w-full flex-1 overflow-y-auto scroll-smooth"
          >
            <div className="relative w-16 flex-shrink-0 border-r border-neutral-200 bg-neutral-50/30 dark:border-neutral-800 dark:bg-neutral-900/10">
              {hours.map((hour, idx) => (
                <span
                  key={hour}
                  className="absolute right-2 block -translate-y-1/2 text-xs font-medium text-neutral-400"
                  style={{ top: `${idx * 96}px` }}
                >
                  {hour.toString().padStart(2, "0")}:00
                </span>
              ))}

              {/* Time axis current time */}
              {weekDays.some((day) => isSameDay(day, now)) && (
                <span
                  className="absolute right-1 z-20 block -translate-y-1/2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm transition-all"
                  style={{
                    top: `${now.getHours() * 96 + (now.getMinutes() / 60) * 96}px`,
                  }}
                >
                  {format(now, "HH:mm")}
                </span>
              )}
              <div style={{ height: `${hours.length * 96}px` }} />
            </div>
            <div className="relative flex flex-1 pl-px">
              {/* Horizontal grid lines */}
              <div className="pointer-events-none absolute inset-0">
                {hours.map((hour, idx) => (
                  <div
                    key={hour}
                    className="absolute right-0 left-0 w-full border-t border-neutral-200 dark:border-neutral-800"
                    style={{ top: `${idx * 96}px` }}
                  />
                ))}
              </div>
              {/* Columns */}
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative z-10 flex-1 border-l border-neutral-100 dark:border-neutral-800",
                    isToday(day) && "bg-neutral-50/30 dark:bg-neutral-900/20"
                  )}
                >
                  {/* Current Time Line */}
                  {isSameDay(day, now) && (
                    <div
                      className="pointer-events-none absolute right-0 left-0 z-50 h-[2px] bg-red-500"
                      style={{
                        top: `${now.getHours() * 96 + (now.getMinutes() / 60) * 96}px`,
                      }}
                    >
                      <div className="absolute -top-[5px] -left-[5px] h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    </div>
                  )}

                  {visibleTasks
                    .filter((t) => isSameDay(t.start, day) && t.hasTime)
                    .map((task) => {
                      const startHour = task.start.getHours()
                      const durationHours =
                        (task.end.getTime() - task.start.getTime()) /
                        (1000 * 60 * 60)
                      if (
                        startHour < hours[0] ||
                        startHour > hours[hours.length - 1]
                      )
                        return null

                      const topOffset =
                        (startHour - hours[0]) * 96 +
                        (task.start.getMinutes() / 60) * 96
                      const heightPixels = durationHours * 96

                      return (
                        <Link
                          href={`/task/${task.id}`}
                          key={task.id}
                          className={cn(
                            "absolute right-1 left-1 flex flex-col gap-1 overflow-hidden rounded-xl border p-3 shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md",
                            task.color
                          )}
                          style={{
                            top: `${topOffset}px`,
                            height: `${heightPixels}px`,
                          }}
                        >
                          <h3 className="truncate text-sm leading-tight font-semibold">
                            {task.title}
                          </h3>
                          <p className="line-clamp-2 text-xs leading-tight opacity-80">
                            {task.description}
                          </p>
                        </Link>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isMounted) return null

  return (
    <>
      {/* ---------- MOBILE VIEW ---------- */}
      <div className="relative flex h-screen w-full overflow-hidden bg-black md:hidden">
        {/* We use a drag container for left/center/right swipe */}
        <motion.div
          className="flex h-full w-[300vw] flex-row"
          drag="x"
          dragConstraints={{
            left:
              typeof window !== "undefined" ? window.innerWidth * -2 : -1000,
            right: 0,
          }}
          dragElastic={0.05}
          onDragEnd={(e, { offset, velocity }) => {
            const threshold =
              (typeof window !== "undefined" ? window.innerWidth : 500) / 3
            // Swiping right => moving left logically
            if (offset.x > threshold || velocity.x > 500) {
              if (activeScreen === "right") setActiveScreen("center")
              else if (activeScreen === "center") setActiveScreen("left")
            }
            // Swiping left => moving right logically
            else if (offset.x < -threshold || velocity.x < -500) {
              if (activeScreen === "left") setActiveScreen("center")
              else if (activeScreen === "center") setActiveScreen("right")
            }
          }}
          animate={{
            x:
              activeScreen === "left"
                ? 0
                : activeScreen === "center"
                  ? "-100vw"
                  : "-200vw",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
        >
          {/* Left Screen: Calendar */}
          <div className="h-full w-screen flex-shrink-0">
            <MobileLeftScreen
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              toggleView={() => setActiveScreen("center")}
            />
          </div>
          {/* Center Screen: Timeline */}
          <div className="h-full w-screen flex-shrink-0">
            <MobileRightScreen
              selectedDate={selectedDate}
              tasks={visibleTasks}
            />
          </div>
          {/* Right Screen: Task List */}
          <div className="h-full w-screen flex-shrink-0">
            <TaskListSection
              tasks={visibleTasks}
              selectedDate={selectedDate}
              showCompleted={showCompleted}
              setShowCompleted={setShowCompleted}
            />
          </div>
        </motion.div>

        {/* Native mobile pagination indicators */}
        <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center gap-2">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              activeScreen === "left"
                ? "w-6 bg-neutral-900 dark:bg-white"
                : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
            )}
          />
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              activeScreen === "center"
                ? "w-6 bg-neutral-900 dark:bg-white"
                : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
            )}
          />
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              activeScreen === "right"
                ? "w-6 bg-neutral-900 dark:bg-white"
                : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
            )}
          />
        </div>
      </div>

      {/* ---------- DESKTOP VIEW ---------- */}
      <div className="hidden h-screen w-full overflow-hidden bg-neutral-100 font-sans md:flex dark:bg-neutral-900">
        {/* Sidebar */}
        <aside className="z-10 flex h-full w-80 flex-shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mt-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <CalendarDays className="h-6 w-6" />
              <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
            </div>
            <Link
              href="/settings"
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>

          <Link
            href="/new-event"
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3.5 font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] active:scale-[0.98] dark:bg-white dark:text-neutral-900"
          >
            + Nova Tarefa
          </Link>

          <div className="mb-6 flex rounded-xl bg-neutral-200/50 p-1 dark:bg-neutral-800/50">
            <button
              onClick={() => setDesktopView("calendar")}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                desktopView === "calendar"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              Calendário
            </button>
            <button
              onClick={() => setDesktopView("list")}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                desktopView === "list"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              Lista
            </button>
          </div>

          <Calendar
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            className="mb-8 border-none bg-transparent shadow-none dark:bg-transparent"
          />

          <div className="mt-4">
            <h3 className="mb-4 px-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Filtros Rápidos
            </h3>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-500"
                />
                Mostrar Concluídos
              </label>
              {["Trabalho", "Pessoal", "Projetos"].map((filter) => (
                <button
                  key={filter}
                  className="flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left font-medium text-ellipsis whitespace-nowrap text-neutral-700 transition-colors hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Dashboard Area */}
        {desktopView === "calendar" ? (
          <DesktopWeekView />
        ) : (
          <div className="relative flex h-full flex-1 flex-col overflow-hidden rounded-l-3xl border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
            <TaskListSection
              tasks={visibleTasks}
              selectedDate={selectedDate}
              showCompleted={showCompleted}
              setShowCompleted={setShowCompleted}
            />
          </div>
        )}
      </div>
    </>
  )
}
