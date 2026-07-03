import { useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Id, Task } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import { getLabelColor, getPriorityConfig, type ColumnAccent } from '../constants'

interface TaskCardProps {
  task: Task
  accent: ColumnAccent
  onSelect: (taskId: Id) => void
}

export default function TaskCard({ task, accent, onSelect }: TaskCardProps) {
  const archiveTask = useKanbanStore((state) => state.archiveTask)
  const priority = getPriorityConfig(task.priority)
  const allLabels = useKanbanStore((state) => state.labels)
  const labelIds = task.labelIds
  const labels = useMemo(
    () => (labelIds && labelIds.length > 0 ? allLabels.filter((label) => labelIds.includes(label.id)) : []),
    [allLabels, labelIds],
  )

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const checklist = task.checklist ?? []
  const doneCount = checklist.filter((item) => item.done).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Task: ${task.content}`}
      onClick={() => onSelect(task.id)}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e)
        if (e.key === 'Enter') onSelect(task.id)
      }}
      className={`group flex touch-none cursor-pointer items-start gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-violet-300 focus-visible:outline-2 focus-visible:outline-violet-500 dark:bg-slate-800 dark:ring-slate-700 dark:hover:ring-violet-500/60 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />

      <div className="min-w-0 flex-1">
        {(labels.length > 0 || priority) && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {priority && (
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${priority.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
            )}
            {labels.map((label) => (
              <span
                key={label.id}
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getLabelColor(label.color).chip}`}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
        <p className="break-words text-sm text-slate-800 dark:text-slate-100">{task.content}</p>
        {checklist.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className={`h-full rounded-full ${accent.dot}`}
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
              {doneCount}/{checklist.length}
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          archiveTask(task.id)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Archive task"
        className="-m-1 shrink-0 p-1 text-slate-400 opacity-0 transition-opacity hover:text-rose-500 focus-visible:opacity-100 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
