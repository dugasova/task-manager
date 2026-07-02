import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Id, Task } from '../types'
import { useKanbanStore } from '../store/kanbanStore'

interface TaskCardProps {
  task: Task
  onSelect: (taskId: Id) => void
}

export default function TaskCard({ task, onSelect }: TaskCardProps) {
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
      className={`group flex cursor-pointer items-start justify-between gap-2 rounded-md bg-white p-3 shadow-sm ring-1 ring-gray-200 hover:ring-blue-300 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm text-gray-800">{task.content}</p>
        {checklist.length > 0 && (
          <p className="mt-1 text-xs text-gray-400">
            ☑ {doneCount}/{checklist.length}
          </p>
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
        className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
