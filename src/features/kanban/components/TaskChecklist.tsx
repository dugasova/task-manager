import { useState } from 'react'
import type { ChecklistItem, Id } from '../types'
import type { ColumnAccent } from '../constants'
import { useKanbanStore } from '../store/kanbanStore'
import Button from '../../../componrnts/Button'
import Input from '../../../componrnts/Input'

interface TaskChecklistProps {
  taskId: Id
  checklist: ChecklistItem[]
  accent: ColumnAccent
}

export default function TaskChecklist({ taskId, checklist, accent }: TaskChecklistProps) {
  const addChecklistItem = useKanbanStore((state) => state.addChecklistItem)
  const toggleChecklistItem = useKanbanStore((state) => state.toggleChecklistItem)
  const deleteChecklistItem = useKanbanStore((state) => state.deleteChecklistItem)

  const [newItemText, setNewItemText] = useState('')

  const doneCount = checklist.filter((item) => item.done).length
  const progress = checklist.length > 0 ? (doneCount / checklist.length) * 100 : 0

  const handleAddItem = () => {
    const text = newItemText.trim()
    if (!text) return
    addChecklistItem(taskId, text)
    setNewItemText('')
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Checklist{checklist.length > 0 ? ` (${doneCount}/${checklist.length})` : ''}
      </h3>

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
            <label className="flex flex-1 min-w-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleChecklistItem(taskId, item.id)}
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
            </label>
            <button
              type="button"
              onClick={() => deleteChecklistItem(taskId, item.id)}
              aria-label="Delete checklist item"
              className="-m-1 shrink-0 p-1 text-slate-400 opacity-0 transition-opacity hover:text-rose-500 focus-visible:opacity-100 group-hover:opacity-100"
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
          aria-label="New checklist item"
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
  )
}
