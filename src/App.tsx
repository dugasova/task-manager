import KanbanBoard from './features/kanban/components/KanbanBoard'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <KanbanBoard />
    </ErrorBoundary>
  )
}
