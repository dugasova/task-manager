import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import { getColumnAccent } from '../constants'
import { useInlineEdit } from '../../../hooks/useInlineEdit'
import TaskChecklist from './TaskChecklist'
import Input from '../../../componrnts/Input'

interface TaskDetailModalProps {
  taskId: Id
  onClose: () => void
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const task = useKanbanStore((state) => state.tasks.find((t) => t.id === taskId))
  const columnIndex = useKanbanStore((state) =>
    task ? state.columns.findIndex((c) => c.id === task.columnId) : -1,
  )
  const updateTaskContent = useKanbanStore((state) => state.updateTaskContent)
  const updateTaskDescription = useKanbanStore((state) => state.updateTaskDescription)

  const title = useInlineEdit(task?.content ?? '', (value) => {
    if (task) updateTaskContent(task.id, value)
  })

  const [descriptionValue, setDescriptionValue] = useState(task?.description ?? '')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!task) onClose()
  }, [task, onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    return () => {
      previouslyFocused?.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!task) return null

  const accent = getColumnAccent(Math.max(columnIndex, 0))

  const commitDescription = () => {
    if (descriptionValue !== (task.description ?? '')) {
      updateTaskDescription(task.id, descriptionValue)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 shrink-0 ${accent.bar}`} />

        <div className="flex flex-col overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between gap-2">
            <Input
              autoFocus
              aria-label="Task title"
              value={title.draft}
              onChange={(e) => title.setDraft(e.target.value)}
              onBlur={title.commit}
              onKeyDown={title.handleKeyDown}
              className="flex-1 text-base font-semibold"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-m-1 shrink-0 p-1 text-slate-400 transition-colors hover:text-rose-500"
            >
              ✕
            </button>
          </div>

          <div className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Description
            </h3>
            <textarea
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onBlur={commitDescription}
              placeholder="Add a more detailed description..."
              aria-label="Task description"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-400"
            />
          </div>

          <TaskChecklist taskId={task.id} checklist={task.checklist ?? []} accent={accent} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
