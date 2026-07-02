import type { ButtonHTMLAttributes } from 'react'

export default function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${className}`}
      {...props}
    />
  )
}
