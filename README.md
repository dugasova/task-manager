# LikeKanban

A local kanban board built with React + TypeScript. Runs entirely in the browser: all data is stored in `localStorage`, no backend required.

## Features

- **Columns and tasks** — create, rename, delete; drag-and-drop columns and tasks between columns ([@dnd-kit](https://dndkit.com/)).
- **Task card** — description, checklist with progress, priority (low/medium/high), colored labels.
- **Labels** — create labels with a color picker, assign/remove them on tasks.
- **Task archive** — archive and restore tasks without losing data.
- **Undo/Redo** — history of changes across columns, tasks, and labels.
- **Light/dark theme** — toggle with persisted choice, defaults to system preference.
- **Persistence** — board state is automatically saved to `localStorage` (with a fallback for unavailable storage — private browsing, full quota).

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build tool and dev server
- [Zustand](https://zustand.docs.pmnd.rs/) — state management (slices pattern + `persist` middleware)
- [@dnd-kit](https://dndkit.com/) — drag-and-drop
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — tests

## Project structure

```
src/
  components/           shared UI components (Button, Input, ErrorBoundary)
  hooks/                shared hooks (useTheme, useInlineEdit)
  lib/                  utilities (id generation)
  features/
    kanban/
      components/       board components (KanbanBoard, KanbanColumn, TaskCard, ...)
      store/
        kanbanStore.ts  assembles the store from slices + persists to localStorage
        slices/         columnsSlice, tasksSlice, labelsSlice, historySlice
      types/             domain types (Column, Task, Label, ...)
      constants.ts       color schemes for columns, labels, priorities
```

## Getting started

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # type-check + production build
npm run test      # run tests (vitest run)
npm run test:watch
npm run lint
npm run preview   # preview the production build
```
