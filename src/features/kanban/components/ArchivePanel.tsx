import { createPortal } from 'react-dom'
import { useKanbanStore } from '../store/kanbanStore'

interface ArchivePanelProps {
  onClose: () => void
}

export default function ArchivePanel({ onClose }: ArchivePanelProps) {
  const archivedTasks = useKanbanStore((state) => state.tasks.filter((task) => task.archived))
  const columns = useKanbanStore((state) => state.columns)
  const restoreTask = useKanbanStore((state) => state.restoreTask)
  const deleteTask = useKanbanStore((state) => state.deleteTask)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Archived tasks"
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Archive</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 p-1 text-slate-400 transition-colors hover:text-rose-500"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {archivedTasks.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No archived tasks.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {archivedTasks.map((task) => {
                const column = columns.find((c) => c.id === task.columnId)
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5 dark:border-slate-700"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-800 dark:text-slate-100">{task.content}</p>
                      {column && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">{column.title}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button
                        type="button"
                        onClick={() => restoreTask(task.id)}
                        className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="text-xs font-semibold text-rose-500 hover:underline"
                      >
                        Delete forever
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
