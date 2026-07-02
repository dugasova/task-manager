import KanbanBoard from './features/kanban/components/KanbanBoard'
import ErrorBoundary from './componrnts/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <KanbanBoard />
    </ErrorBoundary>
  )
}
