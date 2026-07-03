import type { Id, Task } from '../types'
import { PRIORITIES } from '../constants'
import { useKanbanStore } from '../store/kanbanStore'

interface TaskPriorityProps {
  taskId: Id
  priority: Task['priority']
}

export default function TaskPriority({ taskId, priority }: TaskPriorityProps) {
  const setTaskPriority = useKanbanStore((state) => state.setTaskPriority)

  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Priority</h3>
      <div className="flex flex-wrap gap-1.5">
        {PRIORITIES.map((option) => {
          const isActive = priority === option.key
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setTaskPriority(taskId, isActive ? undefined : option.key)}
              aria-pressed={isActive}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? option.chip
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${option.dot}`} />
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
