import { useState } from 'react'
import type { Id } from '../types'
import { useKanbanStore } from '../store/kanbanStore'
import { LABEL_COLORS, getLabelColor } from '../constants'
import Button from '../../../components/Button'
import Input from '../../../components/Input'

interface TaskLabelsProps {
  taskId: Id
  labelIds: Id[]
}

export default function TaskLabels({ taskId, labelIds }: TaskLabelsProps) {
  const labels = useKanbanStore((state) => state.labels)
  const addLabel = useKanbanStore((state) => state.addLabel)
  const deleteLabel = useKanbanStore((state) => state.deleteLabel)
  const toggleTaskLabel = useKanbanStore((state) => state.toggleTaskLabel)

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].key)

  const assignedLabels = labels.filter((label) => labelIds.includes(label.id))

  const handleCreateLabel = () => {
    const name = newLabelName.trim()
    if (!name) return
    const id = addLabel(name, newLabelColor)
    toggleTaskLabel(taskId, id)
    setNewLabelName('')
    setNewLabelColor(LABEL_COLORS[0].key)
  }

  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Labels</h3>

      <div className="flex flex-wrap items-center gap-1.5">
        {assignedLabels.map((label) => (
          <span
            key={label.id}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getLabelColor(label.color).chip}`}
          >
            {label.name}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setIsPickerOpen((open) => !open)}
          aria-expanded={isPickerOpen}
          className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-500 hover:border-violet-400 hover:text-violet-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-violet-400 dark:hover:text-violet-400"
        >
          + Label
        </button>
      </div>

      {isPickerOpen && (
        <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          {labels.length > 0 && (
            <div className="mb-3 flex flex-col gap-1">
              {labels.map((label) => (
                <div key={label.id} className="group flex items-center gap-2">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={labelIds.includes(label.id)}
                      onChange={() => toggleTaskLabel(taskId, label.id)}
                      className="shrink-0 accent-violet-500"
                    />
                    <span className={`h-3 w-3 shrink-0 rounded-full ${getLabelColor(label.color).swatch}`} />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-slate-100">
                      {label.name}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteLabel(label.id)}
                    aria-label={`Delete label ${label.name}`}
                    className="-m-1 shrink-0 p-1 text-slate-400 opacity-0 transition-opacity hover:text-rose-500 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-2 flex items-center gap-1.5">
            {LABEL_COLORS.map((color) => (
              <button
                key={color.key}
                type="button"
                onClick={() => setNewLabelColor(color.key)}
                aria-label={`Color ${color.key}`}
                aria-pressed={newLabelColor === color.key}
                className={`h-5 w-5 shrink-0 rounded-full ${color.swatch} ${newLabelColor === color.key ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''
                  }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
              placeholder="New label name..."
              aria-label="New label name"
              className="flex-1"
            />
            <Button
              onClick={handleCreateLabel}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:from-violet-500 hover:to-fuchsia-400"
            >
              Create
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
