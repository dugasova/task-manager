import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KanbanBoard from './KanbanBoard'
import { useKanbanStore } from '../store/kanbanStore'

const resetStore = () => {
  localStorage.clear()
  useKanbanStore.setState({ columns: [], tasks: [] })
}

describe('KanbanBoard', () => {
  beforeEach(resetStore)

  it('adds a column via the form', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard />)

    await user.type(screen.getByLabelText('New column title'), 'To do')
    await user.click(screen.getByRole('button', { name: 'Add column' }))

    expect(screen.getByText('To do')).toBeInTheDocument()
  })

  it('adds a task to a column and opens its detail modal', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard />)

    await user.type(screen.getByLabelText('New column title'), 'To do')
    await user.click(screen.getByRole('button', { name: 'Add column' }))

    await user.type(screen.getByLabelText('New task'), 'Write tests')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    const card = screen.getByLabelText('Task: Write tests')
    expect(card).toBeInTheDocument()

    await user.click(card)

    expect(screen.getByRole('dialog', { name: 'Task details' })).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toHaveValue('Write tests')
  })
})
