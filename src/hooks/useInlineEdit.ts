import { useState, type KeyboardEvent } from 'react'

export function useInlineEdit(value: string, onCommit: (value: string) => void) {
  const [draft, setDraft] = useState(value)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onCommit(trimmed)
    } else {
      setDraft(value)
    }
  }

  const cancel = () => {
    setDraft(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') cancel()
  }

  return { draft, setDraft, commit, cancel, handleKeyDown }
}
