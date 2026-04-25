import React from 'react'
import { X, Layers, TrendingUp, Hash, Target } from 'lucide-react'

export default function DetailPanel({ node, onClose }) {
  if (!node) return null
  return React.createElement('div', { className: 'absolute top-20 right-4 z-30 w-80 glass-strong rounded-xl overflow-hidden' },
    React.createElement('div', { className: 'p-5' },
      React.createElement('div', { className: 'flex items-start justify-between mb-4' },
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-lg font-bold text-white' }, node.title),
          React.createElement('span', { className: 'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium', style: { backgroundColor: node.color + '33', color: node.color } }, node.cluster_name)
        ),
        React.createElement('button', { onClick: onClose, className: 'p-1 rounded-lg hover:bg-slate-700/50' }, React.createElement(X, { className: 'w-5 h-5 text-slate-400' }))
      ),
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', { className: 'flex items-center gap-3 p-3 rounded-lg bg-slate-800/40' },
          React.createElement(Hash, { className: 'w-4 h-4 text-cyan-400' }),
          React.createElement('div', null, React.createElement('p', { className: 'text-[11px] text-slate-500 uppercase' }, 'Node ID'), React.createElement('p', { className: 'text-sm text-slate-200 font-mono' }, node.id))
        ),
        React.createElement('div', { className: 'flex items-center gap-3 p-3 rounded-lg bg-slate-800/40' },
          React.createElement(TrendingUp, { className: 'w-4 h-4 text-green-400' }),
          React.createElement('div', null, React.createElement('p', { className: 'text-[11px] text-slate-500 uppercase' }, 'Importance'), React.createElement('p', { className: 'text-sm text-slate-200' }, (node.importance_score * 100).toFixed(1) + '%'))
        ),
        React.createElement('div', { className: 'flex items-center gap-3 p-3 rounded-lg bg-slate-800/40' },
          React.createElement(Layers, { className: 'w-4 h-4 text-purple-400' }),
          React.createElement('div', null, React.createElement('p', { className: 'text-[11px] text-slate-500 uppercase' }, 'Cluster'), React.createElement('p', { className: 'text-sm text-slate-200' }, node.cluster_name))
        ),
        React.createElement('div', { className: 'flex items-center gap-3 p-3 rounded-lg bg-slate-800/40' },
          React.createElement(Target, { className: 'w-4 h-4 text-orange-400' }),
          React.createElement('div', null, React.createElement('p', { className: 'text-[11px] text-slate-500 uppercase' }, 'Position'), React.createElement('p', { className: 'text-sm text-slate-200 font-mono' }, 'X: ' + node.x.toFixed(2) + ', Y: ' + node.y.toFixed(2) + ', Z: ' + node.z.toFixed(2)))
        )
      )
    )
  )
}
