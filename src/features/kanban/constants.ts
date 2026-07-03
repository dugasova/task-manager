export interface ColumnAccent {
  bar: string
  dot: string
  badge: string
}

export const COLUMN_ACCENTS: ColumnAccent[] = [
  {
    bar: 'bg-violet-500',
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  },
  {
    bar: 'bg-pink-500',
    dot: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  },
  {
    bar: 'bg-sky-500',
    dot: 'bg-sky-500',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  },
  {
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  {
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  {
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
]

export function getColumnAccent(index: number): ColumnAccent {
  return COLUMN_ACCENTS[index % COLUMN_ACCENTS.length]
}

export interface LabelColor {
  key: string
  swatch: string
  chip: string
}

export const LABEL_COLORS: LabelColor[] = [
  {
    key: 'rose',
    swatch: 'bg-rose-500',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
  {
    key: 'orange',
    swatch: 'bg-orange-500',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  },
  {
    key: 'amber',
    swatch: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  {
    key: 'lime',
    swatch: 'bg-lime-500',
    chip: 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300',
  },
  {
    key: 'emerald',
    swatch: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  {
    key: 'cyan',
    swatch: 'bg-cyan-500',
    chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  },
  {
    key: 'blue',
    swatch: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  },
  {
    key: 'purple',
    swatch: 'bg-purple-500',
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  },
]

export function getLabelColor(key: string): LabelColor {
  return LABEL_COLORS.find((color) => color.key === key) ?? LABEL_COLORS[0]
}

export interface PriorityConfig {
  key: 'low' | 'medium' | 'high'
  label: string
  dot: string
  chip: string
}

export const PRIORITIES: PriorityConfig[] = [
  {
    key: 'low',
    label: 'Low',
    dot: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
  },
  {
    key: 'medium',
    label: 'Medium',
    dot: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  {
    key: 'high',
    label: 'High',
    dot: 'bg-rose-500',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
]

export function getPriorityConfig(key?: string): PriorityConfig | undefined {
  return PRIORITIES.find((priority) => priority.key === key)
}
