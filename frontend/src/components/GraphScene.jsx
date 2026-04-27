import React, { useMemo, useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import GraphNode from "./GraphNode"
import GraphEdge from "./GraphEdge"
import EdgeParticles from "./EdgeParticles"
import ClusterHulls from "./ClusterHulls"
import centralizedData from "../data/centralized.json"
import decentralizedData from "../data/decentralized.json"
import distributedData from "../data/distributed.json"

const DATA_MAP = {
  centralized: centralizedData,
  decentralized: decentralizedData,
  distributed: distributedData,
}

const MORPH_DURATION = 1.2 // seconds
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

export default function GraphScene({ topology, selectedNode, onSelectNode, searchQuery, showHulls, showParticles, onDataChange }) {
  const [currentTopology, setCurrentTopology] = useState(topology)
  const [animating, setAnimating] = useState(false)
  const animStartRef = useRef(0)
  const fromPositionsRef = useRef({})
  const toPositionsRef = useRef({})
  const startPositionsRef = useRef({})

  const currentData = useMemo(() => DATA_MAP[currentTopology] || centralizedData, [currentTopology])
  const targetData = useMemo(() => DATA_MAP[topology], [topology])

  // Trigger morph when topology prop changes
  useEffect(() => {
    if (topology === currentTopology) return

    const fromData = DATA_MAP[currentTopology] || centralizedData
    const toData = DATA_MAP[topology]

    const allIds = new Set([...fromData.nodes.map(n => n.id), ...toData.nodes.map(n => n.id)])
    const fromMap = new Map(fromData.nodes.map(n => [n.id, n]))
    const toMap = new Map(toData.nodes.map(n => [n.id, n]))

    // Capture current animated positions if mid-animation
    const currentPos = startPositionsRef.current || {}
    const fromPos = {}
    const toPos = {}

    allIds.forEach(id => {
      const fromNode = fromMap.get(id)
      const toNode = toMap.get(id)

      if (fromNode) {
        fromPos[id] = currentPos[id] || { x: fromNode.x, y: fromNode.y, z: fromNode.z, size: fromNode.size, color: fromNode.color, cluster_id: fromNode.cluster_id, cluster_name: fromNode.cluster_name, title: fromNode.title, importance_score: fromNode.importance_score }
      } else {
        fromPos[id] = currentPos[id] || { x: 0, y: 0, z: 0, size: 0.01, color: toNode.color, cluster_id: toNode.cluster_id, cluster_name: toNode.cluster_name, title: toNode.title, importance_score: toNode.importance_score }
      }

      if (toNode) {
        toPos[id] = { x: toNode.x, y: toNode.y, z: toNode.z, size: toNode.size, color: toNode.color, cluster_id: toNode.cluster_id, cluster_name: toNode.cluster_name, title: toNode.title, importance_score: toNode.importance_score }
      } else {
        const f = fromMap.get(id)
        toPos[id] = { x: 0, y: 0, z: 0, size: 0.01, color: f.color, cluster_id: f.cluster_id, cluster_name: f.cluster_name, title: f.title, importance_score: f.importance_score }
      }
    })

    fromPositionsRef.current = fromPos
    toPositionsRef.current = toPos
    startPositionsRef.current = fromPos
    animStartRef.current = performance.now()
    setAnimating(true)
    setCurrentTopology(topology)
  }, [topology, currentTopology])

  // Animation frame loop
  const frameNodesRef = useRef([])
  useFrame(() => {
    if (!animating) {
      frameNodesRef.current = currentData.nodes
      startPositionsRef.current = Object.fromEntries(currentData.nodes.map(n => [n.id, { ...n }]))
      return
    }

    const elapsed = (performance.now() - animStartRef.current) / 1000
    const progress = Math.min(elapsed / MORPH_DURATION, 1)
    const eased = easeOutCubic(progress)

    const fromPos = fromPositionsRef.current
    const toPos = toPositionsRef.current

    const interpolated = Object.keys(toPos).map(id => {
      const fid = parseInt(id)
      const f = fromPos[id] || { x: 0, y: 0, z: 0, size: 0.01, color: "#00aaff" }
      const t = toPos[id] || { x: 0, y: 0, z: 0, size: 0.01, color: "#00aaff" }

      const current = {
        id: fid,
        x: f.x + (t.x - f.x) * eased,
        y: f.y + (t.y - f.y) * eased,
        z: f.z + (t.z - f.z) * eased,
        color: t.color,
        size: f.size + (t.size - f.size) * eased,
        cluster_id: t.cluster_id,
        cluster_name: t.cluster_name,
        title: t.title,
        importance_score: t.importance_score,
      }
      startPositionsRef.current[id] = current
      return current
    })

    frameNodesRef.current = interpolated

    if (progress >= 1) {
      setAnimating(false)
    }
  })

  const nodes = animating ? frameNodesRef.current : currentData.nodes
  const edges = targetData.edges

  // Report data up for analytics
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ nodes, edges })
    }
  }, [nodes, edges, onDataChange])

  // Search filtering
  const highlightedIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set(nodes.map(n => n.id))
    const q = searchQuery.toLowerCase()
    return new Set(nodes.filter(n => n.title.toLowerCase().includes(q)).map(n => n.id))
  }, [nodes, searchQuery])

  return React.createElement("group", null,
    // Cluster hulls
    showHulls && React.createElement(ClusterHulls, { nodes: nodes, topology: currentTopology }),
    // Edges
    edges.map((edge, i) => {
      const src = nodes.find(n => n.id === edge.source)
      const tgt = nodes.find(n => n.id === edge.target)
      if (!src || !tgt) return null
      return React.createElement(GraphEdge, { key: `e-${i}`, edge: edge, sourceNode: src, targetNode: tgt, isHighlighted: highlightedIds.has(edge.source) && highlightedIds.has(edge.target), searchActive: !!searchQuery.trim() })
    }),
    // Edge particles
    showParticles && React.createElement(EdgeParticles, { edges: edges, nodes: nodes, topology: currentTopology }),
    // Nodes
    nodes.map((node) => React.createElement(GraphNode, {
      key: `n-${node.id}`,
      node: node,
      isSelected: selectedNode?.id === node.id,
      isHighlighted: highlightedIds.has(node.id),
      isDimmed: searchQuery.trim() && !highlightedIds.has(node.id),
      onSelect: onSelectNode
    }))
  )
}
