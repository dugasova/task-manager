import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useShallow } from 'zustand/react/shallow'
import type { Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import { useTheme } from '../../../hooks/useTheme'
import KanbanColumn from './KanbanColumn'
import TaskDetailModal from './TaskDetailModal'
import ArchivePanel from './ArchivePanel'
import Button from '../../../components/Button'
import Input from '../../../components/Input'

export default function KanbanBoard() {
  const { columns, tasks, addColumn, moveTask, reorderColumns, undo, redo, canUndo, canRedo } =
    useKanbanStore(useShallow((state) => ({
      columns: state.columns,
      tasks: state.tasks,
      addColumn: state.addColumn,
      moveTask: state.moveTask,
      reorderColumns: state.reorderColumns,
      undo: state.undo,
      redo: state.redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    })))

  const [columnTitle, setColumnTitle] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<Id | null>(null)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])
  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks])
  const archivedCount = tasks.length - activeTasks.length
  const taskCount = activeTasks.length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleAddColumn = () => {
    const title = columnTitle.trim()
    if (!title) return
    addColumn(title)
    setColumnTitle('')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isEditable =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (isEditable) return

      const isMod = e.metaKey || e.ctrlKey
      if (!isMod || e.key.toLowerCase() !== 'z') return

      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'Column' && overType === 'Column') {
      reorderColumns(active.id, over.id)
      return
    }

    if (activeType === 'Task') {
      const overColumnId = overType === 'Task' ? over.data.current?.task.columnId : over.id
      const targetIndex =
        overType === 'Task'
          ? tasks.findIndex((task) => task.id === over.id)
          : tasks.length

      moveTask(active.id, overColumnId, targetIndex)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">
              Like Kanban
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {columns.length} {columns.length === 1 ? 'column' : 'columns'} · {taskCount}{' '}
              {taskCount === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400 dark:disabled:hover:border-slate-700 dark:disabled:hover:text-slate-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
              </svg>
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400 dark:disabled:hover:border-slate-700 dark:disabled:hover:text-slate-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsArchiveOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
            >
              Archive{archivedCount > 0 ? ` (${archivedCount})` : ''}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <Input
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
            placeholder="New column title..."
            aria-label="New column title"
            className="w-full min-w-0 sm:w-64"
          />
          <Button
            onClick={handleAddColumn}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:from-violet-500 hover:to-fuchsia-400"
          >
            Add column
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid flex-1 auto-cols-[18rem] grid-flow-col gap-4 overflow-x-auto pb-4">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {columns.map((column, index) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  accentIndex={index}
                  onSelectTask={setSelectedTaskId}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        {selectedTaskId !== null && (
          <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
        )}

        {isArchiveOpen && <ArchivePanel onClose={() => setIsArchiveOpen(false)} />}
      </div>
    </div>
  )
}
