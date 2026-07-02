import { useState, useMemo } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Column, Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import TaskCard from './TaskCard'
import Button from '../../../componrnts/Button'
import Input from '../../../componrnts/Input'

interface KanbanColumnProps {
  column: Column
  onSelectTask: (taskId: Id) => void
}

export default function KanbanColumn({ column, onSelectTask }: KanbanColumnProps) {
  const allTasks = useKanbanStore((state) => state.tasks)
  const tasks = useMemo(
    () => allTasks.filter((task) => task.columnId === column.id),
    [allTasks, column.id],
  )
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks])
  const addTask = useKanbanStore((state) => state.addTask)
  const deleteColumn = useKanbanStore((state) => state.deleteColumn)
  const updateColumnTitle = useKanbanStore((state) => state.updateColumnTitle)

  const [taskContent, setTaskContent] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column.title)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleAddTask = () => {
    const content = taskContent.trim()
    if (!content) return
    addTask(column.id, content)
    setTaskContent('')
  }

  const commitTitle = () => {
    const title = titleValue.trim()
    if (title && title !== column.title) {
      updateColumnTitle(column.id, title)
    } else {
      setTitleValue(column.title)
    }
    setIsEditingTitle(false)
  }

  const cancelTitleEdit = () => {
    setTitleValue(column.title)
    setIsEditingTitle(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex max-h-full w-72 shrink-0 flex-col rounded-lg bg-gray-100 p-3 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mb-3 flex items-center justify-between gap-2"
      >
        {isEditingTitle ? (
          <Input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') cancelTitleEdit()
            }}
            className="min-w-0 flex-1"
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            onPointerDown={(e) => e.stopPropagation()}
            className="truncate font-semibold text-gray-700"
          >
            {column.title}
          </h2>
        )}
        <button
          type="button"
          onClick={() => deleteColumn(column.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Delete column"
          className="shrink-0 text-gray-400 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={taskContent}
          onChange={(e) => setTaskContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="New task..."
          className="flex-1"
        />
        <Button onClick={handleAddTask} className="bg-blue-500 text-white hover:bg-blue-600">
          Add
        </Button>
      </div>
    </div>
  )
}
