import React, { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import GraphScene from './components/GraphScene'
import DetailPanel from './components/DetailPanel'
import TopologySwitcher from './components/TopologySwitcher'
import SearchBar from './components/SearchBar'
import HandTracker from './components/HandTracker'
import { Network, Hand, RotateCcw } from 'lucide-react'

export default function App() {
  const [topology, setTopology] = useState('centralized')
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [handControlEnabled, setHandControlEnabled] = useState(false)
  const controlsRef = useRef()

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) controlsRef.current.reset()
  }, [])

  const handleTopologySwitch = useCallback((newTopology) => {
    setTopology(newTopology)
    setSelectedNode(null)
  }, [])

  const handleGesture = useCallback((gesture) => {
    if (!controlsRef.current) return
    if (gesture === 'rotate') {
      controlsRef.current.autoRotate = true
      setTimeout(() => { if (controlsRef.current) controlsRef.current.autoRotate = false }, 1000)
    } else if (gesture === 'zoom_in') {
      controlsRef.current.object.position.multiplyScalar(0.9)
    } else if (gesture === 'zoom_out') {
      controlsRef.current.object.position.multiplyScalar(1.1)
    } else if (gesture === 'switch_topology') {
      const tops = ['centralized', 'decentralized', 'distributed']
      setTopology(tops[(tops.indexOf(topology) + 1) % 3])
      setSelectedNode(null)
    } else if (gesture === 'reset') {
      controlsRef.current.reset()
    }
  }, [topology])

  const btnClass = handControlEnabled ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800/60 border-slate-600/30 text-slate-300 hover:bg-slate-700/60'

  return React.createElement('div', { className: 'relative w-screen h-screen overflow-hidden bg-slate-950' },
    React.createElement('div', { className: 'absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 glass' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement(Network, { className: 'w-6 h-6 text-cyan-400' }),
        React.createElement('h1', { className: 'text-xl font-bold tracking-tight text-white' }, 'MindMesh ', React.createElement('span', { className: 'text-cyan-400' }, 'AI'))
      ),
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement(SearchBar, { value: searchQuery, onChange: setSearchQuery }),
        React.createElement('button', { onClick: handleResetCamera, className: 'p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 transition-all' },
          React.createElement(RotateCcw, { className: 'w-4 h-4 text-slate-300' })
        ),
        React.createElement('button', { onClick: () => setHandControlEnabled(!handControlEnabled), className: `flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${btnClass}` },
          React.createElement(Hand, { className: 'w-4 h-4' }),
          React.createElement('span', { className: 'text-sm font-medium' }, handControlEnabled ? 'Hand On' : 'Hand Off')
        )
      )
    ),
    React.createElement(TopologySwitcher, { current: topology, onSwitch: handleTopologySwitch }),
    React.createElement(Canvas, { camera: { position: [12, 8, 12], fov: 50 }, className: 'w-full h-full', gl: { antialias: true, alpha: false } },
      React.createElement('color', { attach: 'background', args: ['#020617'] }),
      React.createElement('fog', { attach: 'fog', args: ['#020617', 20, 50] }),
      React.createElement('ambientLight', { intensity: 0.3 }),
      React.createElement('pointLight', { position: [10, 10, 10], intensity: 0.8 }),
      React.createElement('pointLight', { position: [-10, -10, -10], intensity: 0.3, color: '#00aaff' }),
      React.createElement(Stars, { radius: 50, depth: 50, count: 2000, factor: 3, fade: true, speed: 1 }),
      React.createElement(GraphScene, { topology: topology, selectedNode: selectedNode, onSelectNode: setSelectedNode, searchQuery: searchQuery }),
      React.createElement(OrbitControls, { ref: controlsRef, enablePan: true, enableZoom: true, enableRotate: true, minDistance: 5, maxDistance: 40, autoRotate: false, autoRotateSpeed: 0.5 })
    ),
    React.createElement(DetailPanel, { node: selectedNode, onClose: () => setSelectedNode(null) }),
    React.createElement(HandTracker, { enabled: handControlEnabled, onGesture: handleGesture, onSelectNode: setSelectedNode, topology: topology }),
    React.createElement('div', { className: 'absolute bottom-4 left-4 z-10 glass rounded-lg px-4 py-3 max-w-xs' },
      React.createElement('p', { className: 'text-xs text-slate-400 mb-1 font-medium' }, 'Controls'),
      React.createElement('div', { className: 'text-[11px] text-slate-500 space-y-0.5' },
        React.createElement('p', null, 'Left click + drag to rotate'),
        React.createElement('p', null, 'Scroll to zoom'),
        React.createElement('p', null, 'Right click + drag to pan'),
        React.createElement('p', null, 'Click node to view details')
      )
    )
  )
}
