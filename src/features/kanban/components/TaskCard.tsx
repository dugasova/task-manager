import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Id, Task } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import type { ColumnAccent } from '../constants'

interface TaskCardProps {
  task: Task
  accent: ColumnAccent
  onSelect: (taskId: Id) => void
}

export default function TaskCard({ task, accent, onSelect }: TaskCardProps) {
  const deleteTask = useKanbanStore((state) => state.deleteTask)

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
      onClick={() => onSelect(task.id)}
      className={`group flex cursor-pointer items-start gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-violet-300 dark:bg-slate-800 dark:ring-slate-700 dark:hover:ring-violet-500/60 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />

      <div className="min-w-0 flex-1">
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
          deleteTask(task.id)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Delete task"
        className="shrink-0 text-slate-400 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
