import { useState, useMemo } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Column, Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import { getColumnAccent } from '../constants'
import { useInlineEdit } from '../../../hooks/useInlineEdit'
import TaskCard from './TaskCard'
import Button from '../../../componrnts/Button'
import Input from '../../../componrnts/Input'

interface KanbanColumnProps {
  column: Column
  accentIndex: number
  onSelectTask: (taskId: Id) => void
}

export default function KanbanColumn({ column, accentIndex, onSelectTask }: KanbanColumnProps) {
  const allTasks = useKanbanStore((state) => state.tasks)
  const tasks = useMemo(
    () => allTasks.filter((task) => task.columnId === column.id),
    [allTasks, column.id],
  )
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks])
  const addTask = useKanbanStore((state) => state.addTask)
  const deleteColumn = useKanbanStore((state) => state.deleteColumn)
  const updateColumnTitle = useKanbanStore((state) => state.updateColumnTitle)

  const accent = getColumnAccent(accentIndex)

  const [taskContent, setTaskContent] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const title = useInlineEdit(column.title, (value) => updateColumnTitle(column.id, value))

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex max-h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className={`h-1.5 shrink-0 ${accent.bar}`} />

      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between gap-2 px-3 pt-3 pb-2 active:cursor-grabbing"
      >
        {isEditingTitle ? (
          <Input
            autoFocus
            aria-label="Column title"
            value={title.draft}
            onChange={(e) => title.setDraft(e.target.value)}
            onBlur={() => {
              title.commit()
              setIsEditingTitle(false)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              title.handleKeyDown(e)
              if (e.key === 'Enter' || e.key === 'Escape') setIsEditingTitle(false)
            }}
            className="min-w-0 flex-1"
          />
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h2
              role="button"
              tabIndex={0}
              onClick={() => setIsEditingTitle(true)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(true)
              }}
              className="truncate rounded font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-500 dark:text-slate-100"
            >
              {column.title}
            </h2>
            {tasks.length > 0 && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${accent.badge}`}>
                {tasks.length}
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => deleteColumn(column.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Delete column"
          className="shrink-0 text-slate-400 transition-colors hover:text-rose-500"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} accent={accent} onSelect={onSelectTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
            No tasks yet
          </p>
        )}
      </div>

      <div className="flex gap-2 p-3 pt-2">
        <Input
          value={taskContent}
          onChange={(e) => setTaskContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="New task..."
          aria-label="New task"
          className="flex-1"
        />
        <Button onClick={handleAddTask} className={`text-white ${accent.bar} hover:brightness-110`}>
          Add
        </Button>
      </div>
    </div>
  )
}
