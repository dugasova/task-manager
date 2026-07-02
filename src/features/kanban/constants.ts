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
