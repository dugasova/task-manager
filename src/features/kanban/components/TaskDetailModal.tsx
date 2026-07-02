import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import Button from '../../../componrnts/Button'
import Input from '../../../componrnts/Input'

interface TaskDetailModalProps {
  taskId: Id
  onClose: () => void
}

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const task = useKanbanStore((state) => state.tasks.find((t) => t.id === taskId))
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
            className="shrink-0 text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Description</h3>
          <textarea
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onBlur={commitDescription}
            placeholder="Add a more detailed description..."
            rows={4}
            className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Checklist{checklist.length > 0 ? ` (${doneCount}/${checklist.length})` : ''}
          </h3>

          <div className="mb-2 flex flex-col gap-1">
            {checklist.map((item) => (
              <div key={item.id} className="group flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklistItem(task.id, item.id)}
                  className="shrink-0"
                />
                <span
                  className={`flex-1 text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                >
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => deleteChecklistItem(task.id, item.id)}
                  aria-label="Delete checklist item"
                  className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
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
            <Button onClick={handleAddItem} className="bg-blue-500 text-white hover:bg-blue-600">
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
