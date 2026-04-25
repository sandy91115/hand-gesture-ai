import React from 'react'
import { Orbit, Globe, GitBranch } from 'lucide-react'

const topologies = [
  { key: 'centralized', label: 'Centralized', icon: Orbit, desc: 'One core, radiating outward' },
  { key: 'decentralized', label: 'Decentralized', icon: Globe, desc: 'Topic hubs on a sphere' },
  { key: 'distributed', label: 'Distributed', icon: GitBranch, desc: 'Peer-to-peer connections' },
]

export default function TopologySwitcher({ current, onSwitch }) {
  return React.createElement('div', { className: 'absolute top-20 left-4 z-30 flex flex-col gap-2' },
    ...topologies.map(t => {
      const Icon = t.icon
      const isActive = current === t.key
      return React.createElement('button', {
        key: t.key,
        onClick: () => onSwitch(t.key),
        className: 'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all min-w-[200px] ' + (isActive ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-900/60 border-slate-700/30 hover:bg-slate-800/60')
      },
        React.createElement(Icon, { className: 'w-5 h-5 ' + (isActive ? 'text-cyan-400' : 'text-slate-500'), strokeWidth: 1.5 }),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-sm font-semibold ' + (isActive ? 'text-white' : 'text-slate-300') }, t.label),
          React.createElement('p', { className: 'text-[10px] text-slate-500 mt-0.5' }, t.desc)
        )
      )
    })
  )
}
