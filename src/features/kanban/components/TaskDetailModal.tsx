import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import { getColumnAccent } from '../constants'
import Button from '../../../componrnts/Button'
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
  const addChecklistItem = useKanbanStore((state) => state.addChecklistItem)
  const toggleChecklistItem = useKanbanStore((state) => state.toggleChecklistItem)
  const deleteChecklistItem = useKanbanStore((state) => state.deleteChecklistItem)

  const [titleValue, setTitleValue] = useState(task?.content ?? '')
  const [descriptionValue, setDescriptionValue] = useState(task?.description ?? '')
  const [newItemText, setNewItemText] = useState('')

  useEffect(() => {
    if (!task) onClose()
  }, [task, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!task) return null

  const accent = getColumnAccent(Math.max(columnIndex, 0))

  const commitTitle = () => {
    const title = titleValue.trim()
    if (title && title !== task.content) {
      updateTaskContent(task.id, title)
    } else {
      setTitleValue(task.content)
    }
  }

  const commitDescription = () => {
    if (descriptionValue !== (task.description ?? '')) {
      updateTaskDescription(task.id, descriptionValue)
    }
  }

  const handleAddItem = () => {
    const text = newItemText.trim()
    if (!text) return
    addChecklistItem(task.id, text)
    setNewItemText('')
  }

  const checklist = task.checklist ?? []
  const doneCount = checklist.filter((item) => item.done).length
  const progress = checklist.length > 0 ? (doneCount / checklist.length) * 100 : 0

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 shrink-0 ${accent.bar}`} />

        <div className="flex flex-col overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between gap-2">
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="flex-1 text-base font-semibold"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 text-slate-400 transition-colors hover:text-rose-500"
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
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-400"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Checklist{checklist.length > 0 ? ` (${doneCount}/${checklist.length})` : ''}
              </h3>
            </div>

            {checklist.length > 0 && (
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all ${accent.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="mb-2 flex flex-col gap-1">
              {checklist.map((item) => (
                <div key={item.id} className="group flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklistItem(task.id, item.id)}
                    className="shrink-0 accent-violet-500"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.done
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteChecklistItem(task.id, item.id)}
                    aria-label="Delete checklist item"
                    className="shrink-0 text-slate-400 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Add an item..."
                className="flex-1"
              />
              <Button
                onClick={handleAddItem}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:from-violet-500 hover:to-fuchsia-400"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
