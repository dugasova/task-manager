import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import { useKanbanStore } from '../store/kanbanStore'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useKanbanStore((state) => state.deleteTask)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-start justify-between gap-2 rounded-md bg-white p-3 shadow-sm ring-1 ring-gray-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <p className="break-words text-sm text-gray-800">{task.content}</p>
      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Delete task"
        className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
