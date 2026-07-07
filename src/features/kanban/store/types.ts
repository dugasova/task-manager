import type { Column, Task, Label } from '../types';
import type { ColumnsSlice } from './slices/columnsSlice';
import type { TasksSlice } from './slices/tasksSlice';
import type { LabelsSlice } from './slices/labelsSlice';
import type { HistorySlice } from './slices/historySlice';

export interface Snapshot {
  columns: Column[];
  tasks: Task[];
  labels: Label[];
}

export type KanbanStore = ColumnsSlice & TasksSlice & LabelsSlice & HistorySlice;
