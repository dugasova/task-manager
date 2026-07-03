import { beforeEach, describe, expect, it } from 'vitest'
import { useKanbanStore } from './kanbanStore'

const resetStore = () => {
  localStorage.clear()
  useKanbanStore.setState({ columns: [], tasks: [], labels: [], past: [], future: [] })
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

  it('sets and clears a task priority', () => {
    useKanbanStore.getState().addColumn('To do')
    const columnId = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().addTask(columnId, 'Task A')
    const taskId = useKanbanStore.getState().tasks[0].id

    useKanbanStore.getState().setTaskPriority(taskId, 'high')
    expect(useKanbanStore.getState().tasks[0].priority).toBe('high')

    useKanbanStore.getState().setTaskPriority(taskId, undefined)
    expect(useKanbanStore.getState().tasks[0].priority).toBeUndefined()
  })

  it('archives and restores a task, hiding it from the active list', () => {
    useKanbanStore.getState().addColumn('To do')
    const columnId = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().addTask(columnId, 'Task A')
    const taskId = useKanbanStore.getState().tasks[0].id

    useKanbanStore.getState().archiveTask(taskId)
    expect(useKanbanStore.getState().tasks[0].archived).toBe(true)

    useKanbanStore.getState().restoreTask(taskId)
    expect(useKanbanStore.getState().tasks[0].archived).toBe(false)
  })

  it('manages labels and assigns them to a task', () => {
    useKanbanStore.getState().addColumn('To do')
    const columnId = useKanbanStore.getState().columns[0].id
    useKanbanStore.getState().addTask(columnId, 'Task A')
    const taskId = useKanbanStore.getState().tasks[0].id

    const labelId = useKanbanStore.getState().addLabel('Bug', 'rose')
    expect(useKanbanStore.getState().labels).toHaveLength(1)

    useKanbanStore.getState().toggleTaskLabel(taskId, labelId)
    expect(useKanbanStore.getState().tasks[0].labelIds).toEqual([labelId])

    useKanbanStore.getState().toggleTaskLabel(taskId, labelId)
    expect(useKanbanStore.getState().tasks[0].labelIds).toEqual([])

    useKanbanStore.getState().deleteLabel(labelId)
    expect(useKanbanStore.getState().labels).toHaveLength(0)
  })

  it('undoes and redoes an action', () => {
    useKanbanStore.getState().addColumn('To do')
    expect(useKanbanStore.getState().columns).toHaveLength(1)

    useKanbanStore.getState().undo()
    expect(useKanbanStore.getState().columns).toHaveLength(0)

    useKanbanStore.getState().redo()
    expect(useKanbanStore.getState().columns).toHaveLength(1)
  })

  it('does not record history for no-op actions', () => {
    useKanbanStore.getState().addColumn('To do')
    const pastLength = useKanbanStore.getState().past.length

    useKanbanStore.getState().moveTask('non-existent-task-id', 'some-column-id', 0)
    expect(useKanbanStore.getState().past.length).toBe(pastLength)
  })

  it('clears redo history after a new action following an undo', () => {
    useKanbanStore.getState().addColumn('A')
    useKanbanStore.getState().addColumn('B')
    useKanbanStore.getState().undo()
    expect(useKanbanStore.getState().future.length).toBe(1)

    useKanbanStore.getState().addColumn('C')
    expect(useKanbanStore.getState().future.length).toBe(0)
  })
})
