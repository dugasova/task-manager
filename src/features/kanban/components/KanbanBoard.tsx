import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useKanbanStore } from '../store/kanbanStore'
import KanbanColumn from './KanbanColumn'
import Button from '../../../componrnts/Button'
import Input from '../../../componrnts/Input'

export default function KanbanBoard() {
  const columns = useKanbanStore((state) => state.columns)
  const tasks = useKanbanStore((state) => state.tasks)
  const addColumn = useKanbanStore((state) => state.addColumn)
  const moveTask = useKanbanStore((state) => state.moveTask)
  const reorderColumns = useKanbanStore((state) => state.reorderColumns)

  const [columnTitle, setColumnTitle] = useState('')

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const handleAddColumn = () => {
    const title = columnTitle.trim()
    if (!title) return
    addColumn(title)
    setColumnTitle('')
  }

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
    <div className="flex h-screen flex-col bg-gray-50 p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Like Kanban</h1>

      <div className="mb-4 flex gap-2">
        <Input
          value={columnTitle}
          onChange={(e) => setColumnTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
          placeholder="New column title..."
          className="w-64"
        />
        <Button onClick={handleAddColumn} className="bg-blue-500 text-white hover:bg-blue-600">
          Add column
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 auto-cols-[18rem] grid-flow-col gap-4 overflow-x-auto pb-4">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  )
}
