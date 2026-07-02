export type Id = string | number;

export interface Column {
  id: Id;
  title: string;
}

export interface ChecklistItem {
  id: Id;
  text: string;
  done: boolean;
}

export interface Label {
  id: Id;
  name: string;
  color: string;
}

export interface Task {
  id: Id;
  columnId: Id;
  content: string;
  description?: string;
  checklist?: ChecklistItem[];
  labelIds?: Id[];
}