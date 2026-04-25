import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !focused) { e.preventDefault(); inputRef.current?.focus() }
      if (e.key === 'Escape' && focused) { inputRef.current?.blur(); onChange('') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focused, onChange])

  return React.createElement('div', { className: 'relative flex items-center w-48' },
    React.createElement(Search, { className: 'absolute left-3 w-4 h-4 text-slate-500' }),
    React.createElement('input', {
      ref: inputRef,
      type: 'text',
      value: value,
      onChange: (e) => onChange(e.target.value),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      placeholder: 'Search nodes...',
      className: 'w-full pl-9 pr-8 py-2 rounded-lg bg-slate-800/60 border border-slate-700/30 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all'
    }),
    value && React.createElement('button', { onClick: () => onChange(''), className: 'absolute right-2 p-0.5 rounded hover:bg-slate-700/50' }, React.createElement(X, { className: 'w-3.5 h-3.5 text-slate-500' }))
  )
}
