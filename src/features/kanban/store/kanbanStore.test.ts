import { beforeEach, describe, expect, it } from 'vitest'
import { useKanbanStore } from './kanbanStore'

const resetStore = () => {
  localStorage.clear()
  useKanbanStore.setState({ columns: [], tasks: [] })
}

describe('kanbanStore', () => {
  beforeEach(resetStore)

  it('adds a column', () => {
    useKanbanStore.getState().addColumn('To do')
    const { columns } = useKanbanStore.getState()
    expect(columns).toHaveLength(1)
    expect(columns[0].title).toBe('To do')
  })

  it('deletes a column', () => {
    useKanbanStore.getState().addColumn('To do')
    const id = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().deleteColumn(id)
    expect(useKanbanStore.getState().columns).toHaveLength(0)
  })

  it('renames a column', () => {
    useKanbanStore.getState().addColumn('To do')
    const id = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().updateColumnTitle(id, 'Doing')
    expect(useKanbanStore.getState().columns[0].title).toBe('Doing')
  })

  it('adds and removes a task', () => {
    useKanbanStore.getState().addColumn('To do')
    const columnId = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().addTask(columnId, 'Write tests')
    expect(useKanbanStore.getState().tasks).toHaveLength(1)

    const taskId = useKanbanStore.getState().tasks[0].id
    useKanbanStore.getState().deleteTask(taskId)
    expect(useKanbanStore.getState().tasks).toHaveLength(0)
  })

  it('moves a task to another column', () => {
    useKanbanStore.getState().addColumn('To do')
    useKanbanStore.getState().addColumn('Done')
    const [todo, done] = useKanbanStore.getState().columns
    useKanbanStore.getState().addTask(todo.id, 'Task A')
    const task = useKanbanStore.getState().tasks[0]

    useKanbanStore.getState().moveTask(task.id, done.id, 0)

    expect(useKanbanStore.getState().tasks[0].columnId).toBe(done.id)
  })

  it('reorders columns', () => {
    useKanbanStore.getState().addColumn('A')
    useKanbanStore.getState().addColumn('B')
    useKanbanStore.getState().addColumn('C')
    const [a, , c] = useKanbanStore.getState().columns

    useKanbanStore.getState().reorderColumns(a.id, c.id)

    expect(useKanbanStore.getState().columns.map((col) => col.title)).toEqual(['B', 'C', 'A'])
  })

  it('manages a checklist', () => {
    useKanbanStore.getState().addColumn('To do')
    const columnId = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().addTask(columnId, 'Task A')
    const taskId = useKanbanStore.getState().tasks[0].id

    useKanbanStore.getState().addChecklistItem(taskId, 'Step 1')
    let task = useKanbanStore.getState().tasks[0]
    expect(task.checklist).toHaveLength(1)
    expect(task.checklist?.[0].done).toBe(false)

    const itemId = task.checklist![0].id
    useKanbanStore.getState().toggleChecklistItem(taskId, itemId)
    task = useKanbanStore.getState().tasks[0]
    expect(task.checklist?.[0].done).toBe(true)

    useKanbanStore.getState().deleteChecklistItem(taskId, itemId)
    task = useKanbanStore.getState().tasks[0]
    expect(task.checklist).toHaveLength(0)
  })
})
