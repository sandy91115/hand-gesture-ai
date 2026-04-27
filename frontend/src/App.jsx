import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import GraphScene from './components/GraphScene'
import DetailPanel from './components/DetailPanel'
import TopologySwitcher from './components/TopologySwitcher'
import SearchBar from './components/SearchBar'
import HandTracker from './components/HandTracker'
import PostProcessing from './components/PostProcessing'
import AnalyticsPanel from './components/AnalyticsPanel'
import { useAppStore } from './store/useAppStore'
import { Network, Hand, RotateCcw, Camera, BarChart3, Box, CircleDot, Keyboard, Image } from 'lucide-react'

function SceneCapture({ trigger, onCapture }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    if (!trigger) return
    gl.render(scene, camera)
    const dataUrl = gl.domElement.toDataURL('image/png')
    onCapture(dataUrl)
  }, [trigger, gl, scene, camera, onCapture])
  return null
}

export default function App() {
  const [topology, setTopology] = useState('centralized')
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [handControlEnabled, setHandControlEnabled] = useState(false)
  const [captureTrigger, setCaptureTrigger] = useState(0)
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] })
  const controlsRef = useRef()

  const showAnalytics = useAppStore(s => s.showAnalytics)
  const toggleAnalytics = useAppStore(s => s.toggleAnalytics)
  const showHulls = useAppStore(s => s.showHulls)
  const toggleHulls = useAppStore(s => s.toggleHulls)
  const showParticles = useAppStore(s => s.showParticles)
  const toggleParticles = useAppStore(s => s.toggleParticles)
  const cameraPresets = useAppStore(s => s.cameraPresets)
  const saveCameraPreset = useAppStore(s => s.saveCameraPreset)
  const loadCameraPreset = useAppStore(s => s.loadCameraPreset)
  const setLastScreenshot = useAppStore(s => s.setLastScreenshot)
  const showShortcuts = useAppStore(s => s.showShortcuts)
  const toggleShortcuts = useAppStore(s => s.toggleShortcuts)

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) controlsRef.current.reset()
  }, [])

  const handleTopologySwitch = useCallback((newTopology) => {
    setTopology(newTopology)
    setSelectedNode(null)
  }, [])

  const handleScreenshot = useCallback(() => {
    setCaptureTrigger(t => t + 1)
  }, [])

  const handleCaptureDone = useCallback((dataUrl) => {
    setLastScreenshot(dataUrl)
    const link = document.createElement('a')
    link.download = `mindmesh-${topology}-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }, [setLastScreenshot, topology])

  const handleSavePreset = useCallback(() => {
    if (!controlsRef.current) return
    const pos = controlsRef.current.object.position
    saveCameraPreset(`Preset ${cameraPresets.length + 1}`, [pos.x, pos.y, pos.z])
  }, [cameraPresets.length, saveCameraPreset])

  const handleLoadPreset = useCallback((idx) => {
    const preset = loadCameraPreset(idx)
    if (preset && controlsRef.current) {
      const [x, y, z] = preset.position
      controlsRef.current.object.position.set(x, y, z)
      controlsRef.current.target.set(0, 0, 0)
    }
  }, [loadCameraPreset])

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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      const key = e.key.toLowerCase()
      if (key === 't') {
        const tops = ['centralized', 'decentralized', 'distributed']
        setTopology(tops[(tops.indexOf(topology) + 1) % 3])
        setSelectedNode(null)
      } else if (key === 'r') {
        handleResetCamera()
      } else if (key === 's' && !e.ctrlKey) {
        e.preventDefault()
        handleScreenshot()
      } else if (key === 'h') {
        setHandControlEnabled(v => !v)
      } else if (key === 'a') {
        toggleAnalytics()
      } else if (key === 'c') {
        toggleHulls()
      } else if (key === 'p') {
        toggleParticles()
      } else if (key === '?') {
        toggleShortcuts()
      } else if (key >= '1' && key <= '3') {
        const idx = parseInt(key) - 1
        handleLoadPreset(idx)
      } else if (key === '0') {
        handleSavePreset()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [topology, handleResetCamera, handleScreenshot, toggleAnalytics, toggleHulls, toggleParticles, toggleShortcuts, handleLoadPreset, handleSavePreset])

  const btnClass = active => active ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800/60 border-slate-600/30 text-slate-300 hover:bg-slate-700/60'

  return React.createElement('div', { id: 'app-root', className: 'relative w-screen h-screen overflow-hidden bg-slate-950' },
    React.createElement('div', { className: 'absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 glass' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement(Network, { className: 'w-6 h-6 text-cyan-400' }),
        React.createElement('h1', { className: 'text-xl font-bold tracking-tight text-white' }, 'MindMesh ', React.createElement('span', { className: 'text-cyan-400' }, 'AI'))
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(SearchBar, { value: searchQuery, onChange: setSearchQuery }),
        React.createElement('button', { onClick: handleScreenshot, title: 'Screenshot (S)', className: 'p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 transition-all' },
          React.createElement(Image, { className: 'w-4 h-4 text-slate-300' })
        ),
        React.createElement('button', { onClick: handleResetCamera, title: 'Reset Camera (R)', className: 'p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 transition-all' },
          React.createElement(RotateCcw, { className: 'w-4 h-4 text-slate-300' })
        ),
        React.createElement('button', { onClick: toggleAnalytics, title: 'Analytics (A)', className: `p-2 rounded-lg border transition-all ${btnClass(showAnalytics)}` },
          React.createElement(BarChart3, { className: 'w-4 h-4' })
        ),
        React.createElement('button', { onClick: toggleHulls, title: 'Cluster Hulls (C)', className: `p-2 rounded-lg border transition-all ${btnClass(showHulls)}` },
          React.createElement(Box, { className: 'w-4 h-4' })
        ),
        React.createElement('button', { onClick: toggleParticles, title: 'Particles (P)', className: `p-2 rounded-lg border transition-all ${btnClass(showParticles)}` },
          React.createElement(CircleDot, { className: 'w-4 h-4' })
        ),
        React.createElement('button', { onClick: handleSavePreset, title: 'Save Camera (0)', className: 'p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 transition-all' },
          React.createElement(Camera, { className: 'w-4 h-4 text-slate-300' })
        ),
        cameraPresets.map((preset, i) =>
          React.createElement('button', { key: i, onClick: () => handleLoadPreset(i), title: `Load ${preset.name} (${i + 1})`, className: 'px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 text-[10px] text-slate-300 transition-all' },
            String(i + 1)
          )
        ),
        React.createElement('button', { onClick: () => setHandControlEnabled(!handControlEnabled), className: `flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${btnClass(handControlEnabled)}` },
          React.createElement(Hand, { className: 'w-4 h-4' }),
          React.createElement('span', { className: 'text-sm font-medium' }, handControlEnabled ? 'Hand On' : 'Hand Off')
        ),
        React.createElement('button', { onClick: toggleShortcuts, title: 'Shortcuts (?)', className: 'p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/30 transition-all' },
          React.createElement(Keyboard, { className: 'w-4 h-4 text-slate-300' })
        )
      )
    ),
    React.createElement(TopologySwitcher, { current: topology, onSwitch: handleTopologySwitch }),
    React.createElement(Canvas, { camera: { position: [12, 8, 12], fov: 50 }, className: 'w-full h-full', gl: { antialias: true, alpha: false, preserveDrawingBuffer: true } },
      React.createElement('color', { attach: 'background', args: ['#020617'] }),
      React.createElement('fog', { attach: 'fog', args: ['#020617', 20, 50] }),
      React.createElement('ambientLight', { intensity: 0.3 }),
      React.createElement('pointLight', { position: [10, 10, 10], intensity: 0.8 }),
      React.createElement('pointLight', { position: [-10, -10, -10], intensity: 0.3, color: '#00aaff' }),
      React.createElement(Stars, { radius: 50, depth: 50, count: 2000, factor: 3, fade: true, speed: 1 }),
      React.createElement(GraphScene, { topology: topology, selectedNode: selectedNode, onSelectNode: setSelectedNode, searchQuery: searchQuery, showHulls: showHulls, showParticles: showParticles, onDataChange: setGraphData }),
      React.createElement(OrbitControls, { ref: controlsRef, enablePan: true, enableZoom: true, enableRotate: true, minDistance: 5, maxDistance: 40, autoRotate: false, autoRotateSpeed: 0.5 }),
      React.createElement(PostProcessing, null),
      React.createElement(SceneCapture, { trigger: captureTrigger, onCapture: handleCaptureDone })
    ),
    React.createElement(AnalyticsPanel, { nodes: graphData.nodes, edges: graphData.edges, visible: showAnalytics }),
    React.createElement(DetailPanel, { node: selectedNode, onClose: () => setSelectedNode(null) }),
    React.createElement(HandTracker, { enabled: handControlEnabled, onGesture: handleGesture, onSelectNode: setSelectedNode, topology: topology }),
    // Keyboard shortcuts overlay
    showShortcuts && React.createElement('div', { className: 'absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm', onClick: toggleShortcuts },
      React.createElement('div', { className: 'glass-strong rounded-2xl p-6 max-w-md w-full mx-4', onClick: e => e.stopPropagation() },
        React.createElement('h2', { className: 'text-lg font-bold text-white mb-4 flex items-center gap-2' },
          React.createElement(Keyboard, { className: 'w-5 h-5 text-cyan-400' }),
          'Keyboard Shortcuts'
        ),
        React.createElement('div', { className: 'grid grid-cols-2 gap-3 text-sm' },
          [['T', 'Cycle topology'], ['R', 'Reset camera'], ['S', 'Screenshot'], ['H', 'Toggle hand tracking'], ['A', 'Toggle analytics'], ['C', 'Toggle cluster hulls'], ['P', 'Toggle particles'], ['0', 'Save camera preset'], ['1-3', 'Load camera preset'], ['?', 'Toggle this help']].map(([k, desc]) =>
            React.createElement('div', { key: k, className: 'flex items-center gap-3' },
              React.createElement('kbd', { className: 'px-2 py-1 rounded bg-slate-800 border border-slate-600 text-xs font-mono text-cyan-300 min-w-[28px] text-center' }, k),
              React.createElement('span', { className: 'text-slate-300' }, desc)
            )
          )
        ),
        React.createElement('p', { className: 'text-xs text-slate-500 mt-4 text-center' }, 'Press ? or click outside to close')
      )
    ),
    // Bottom controls info
    React.createElement('div', { className: 'absolute bottom-4 left-4 z-10 glass rounded-lg px-4 py-3 max-w-xs' },
      React.createElement('p', { className: 'text-xs text-slate-400 mb-1 font-medium' }, 'Controls'),
      React.createElement('div', { className: 'text-[11px] text-slate-500 space-y-0.5' },
        React.createElement('p', null, 'Left click + drag to rotate'),
        React.createElement('p', null, 'Scroll to zoom'),
        React.createElement('p', null, 'Right click + drag to pan'),
        React.createElement('p', null, 'Click node to view details'),
        React.createElement('p', null, React.createElement('span', { className: 'text-cyan-400' }, '?'), ' for keyboard shortcuts')
      )
    )
  )
}

