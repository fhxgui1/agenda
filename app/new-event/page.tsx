"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createEvent, fetchActivityTypes, fetchProjectsAndActivities } from "@/lib/actions/eventActions"
import { ActivityType } from "@/lib/services/types"

// Make sure to define cn if not imported correctly, or manually apply classes
function twMerge(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

type EventType = "Tarefa" | "Compromisso" | "Projeto" | "Rotina" | "Atividade"

export default function NewEventPage() {
  const router = useRouter()
  const [eventType, setEventType] = useState<EventType>("Tarefa")

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [objective, setObjective] = useState("")
  // Steps will now include title and date/time for Project
  const [steps, setSteps] = useState([
    { id: Date.now(), title: "", text: "", date: "", time: "" },
  ])
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [selectedActivityTypeId, setSelectedActivityTypeId] =
    useState<string>("")
  const [parents, setParents] = useState<{ id: string; title: string; eventType: string }[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  useEffect(() => {
    fetchActivityTypes().then((data) => {
      setActivityTypes(data)
      if (data.length > 0) setSelectedActivityTypeId(data[0].id)
    })
    fetchProjectsAndActivities().then(setParents)
  }, [])

  const addStep = () => {
    setSteps([
      ...steps,
      { id: Date.now(), title: "", text: "", date: "", time: "" },
    ])
  }

  const updateStep = (id: number, field: string, value: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    )
  }

  const removeStep = (id: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((step) => step.id !== id))
    }
  }

  // Date/Time
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const eventTypes: EventType[] = [
    "Tarefa",
    "Compromisso",
    "Projeto",
    "Rotina",
    "Atividade",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let startD = new Date()
    let endD = new Date()
    let hasTime = false

    if (eventType === "Projeto") {
      if (startDate) startD = new Date(startDate)
      if (endDate) endD = new Date(endDate)
    } else {
      if (date) {
        if (time) {
          startD = new Date(`${date}T${time}:00`)
          endD = new Date(startD)
          endD.setHours(endD.getHours() + 1)
          hasTime = true
        } else {
          startD = new Date(`${date}T00:00:00`)
          endD = new Date(startD)
        }
      }
    }

    try {
      const typeMapping: any = {
        Tarefa: "Trabalho",
        Compromisso: "Trabalho",
        Projeto: "Projetos",
        Rotina: "Pessoal",
        Atividade: "Pessoal",
      }

      await createEvent({
        title,
        description:
          description + (objective ? `\n\nObjetivo: ${objective}` : ""),
        start: startD,
        end: endD,
        color: "bg-blue-100 border-blue-200 text-blue-700", // Could be driven by activityType
        priority: "Média",
        type: typeMapping[eventType] || "Pessoal",
        eventType,
        hasTime,
        activityTypeId: selectedActivityTypeId || null,
        projectId: selectedProjectId || null,
        steps:
          eventType === "Projeto" || eventType === "Atividade"
            ? steps
                .filter((s) => s.title.trim() !== "" || s.text.trim() !== "")
                .map((s, index) => ({
                  id: index,
                  text: s.title ? `${s.title}: ${s.text}` : s.text,
                  done: false,
                }))
            : [],
      })

      router.push("/")
    } catch (err) {
      console.error(err)
      alert("Erro ao criar evento")
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-6 pt-10 pb-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={() => router.back()}
          className="-ml-2 flex items-center justify-center rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-6 w-6 text-neutral-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Novo Evento
        </h1>
        <button className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Save className="h-5 w-5 text-indigo-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Layout Selector */}
        <div className="hide-scrollbar -mx-6 mb-8 overflow-x-auto px-6">
          <div className="flex w-max gap-2 pb-2">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setEventType(type)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all ${eventType === type ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <form
          className="mx-auto w-full max-w-2xl space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Common Fields: Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 ml-1 block text-sm font-medium text-neutral-500">
                Título
              </label>
              <input
                type="text"
                placeholder={`Ex: ${eventType} importante`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 ml-1 block text-sm font-medium text-neutral-500">
                Descrição
              </label>
              <textarea
                rows={4}
                placeholder="Mais detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 ml-1 block text-sm font-medium text-neutral-500">
                Área de Atuação
              </label>
              <select
                value={selectedActivityTypeId}
                onChange={(e) => setSelectedActivityTypeId(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              >
                <option value="" disabled>
                  Selecione a área...
                </option>
                {activityTypes.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Projetos/Atividades Dropdown */}
            {["Tarefa", "Compromisso", "Rotina"].includes(eventType) && (
              <div className="animate-in duration-300 fade-in slide-in-from-bottom-2">
                <label className="mb-1 ml-1 block text-sm font-medium text-neutral-500">
                  Vincular a (Projeto ou Atividade)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                >
                  <option value="">Nenhum</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.eventType}: {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Projeto Specific Fields */}
          {eventType === "Projeto" && (
            <div className="animate-in space-y-4 duration-300 fade-in slide-in-from-bottom-2">
              <div>
                <label className="mb-1 ml-1 block text-sm font-medium text-neutral-500">
                  Objetivo do Projeto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entregar a versão 1.0 do App"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Steps Fields (Projeto / Atividade) */}
          {(eventType === "Projeto" || eventType === "Atividade") && (
            <div className="animate-in space-y-3 duration-300 fade-in slide-in-from-bottom-2">
              <label className="ml-1 block text-sm font-medium text-neutral-500">
                Etapas / Checklist
              </label>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="relative flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-500 shadow-sm dark:bg-indigo-900/20">
                      {index + 1}
                    </div>

                    <div className="mt-2 flex w-full gap-2">
                      ,
                      <input
                        type="text"
                        placeholder="Título da Etapa"
                        value={step.title}
                        onChange={(e) =>
                          updateStep(step.id, "title", e.target.value)
                        }
                        className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        disabled={steps.length === 1}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                          steps.length === 1
                            ? "cursor-not-allowed text-neutral-400 opacity-30"
                            : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        )}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Descrição detalhada..."
                      value={step.text}
                      onChange={(e) =>
                        updateStep(step.id, "text", e.target.value)
                      }
                      className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                    />

                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={step.date}
                        onChange={(e) =>
                          updateStep(step.id, "date", e.target.value)
                        }
                        className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                      />
                      <input
                        type="time"
                        value={step.time}
                        onChange={(e) =>
                          updateStep(step.id, "time", e.target.value)
                        }
                        className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addStep}
                className="mt-2 flex items-center gap-2 rounded-xl p-2 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              >
                <Plus className="h-4 w-4" />
                Adicionar etapa
              </button>
            </div>
          )}

          {/* Date/Time Fields */}
          <div className="animate-in pt-2 duration-300 fade-in">
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
              Data e Hora
            </h3>

            {eventType === "Projeto" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 ml-1 block text-xs font-medium text-neutral-500">
                    Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 ml-1 block text-xs font-medium text-neutral-500">
                    Fim
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 ml-1 block text-xs font-medium text-neutral-500">
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 md:text-base dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 ml-1 block text-xs font-medium text-neutral-500">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 md:text-base dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 pb-10">
            <button
              type="submit"
              className="w-full rounded-2xl bg-neutral-900 py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] dark:bg-white dark:text-neutral-900"
            >
              Criar {eventType}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
