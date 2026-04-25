import React, { useMemo } from 'react'
import GraphNode from './GraphNode'
import GraphEdge from './GraphEdge'
import centralizedData from '../data/centralized.json'
import decentralizedData from '../data/decentralized.json'
import distributedData from '../data/distributed.json'

const topologyData = {
  centralized: centralizedData,
  decentralized: decentralizedData,
  distributed: distributedData,
}

export default function GraphScene({ topology, selectedNode, onSelectNode, searchQuery }) {
  const data = topologyData[topology] || centralizedData

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return data.nodes
    const q = searchQuery.toLowerCase()
    return data.nodes.filter(n => n.title.toLowerCase().includes(q))
  }, [data.nodes, searchQuery])

  const highlightedIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id))
  }, [filteredNodes])

  return React.createElement('group', null,
    data.edges.map((edge, i) =>
      React.createElement(GraphEdge, {
        key: `${topology}-edge-${i}`,
        edge: edge,
        nodes: data.nodes,
        isHighlighted: highlightedIds.has(edge.source) && highlightedIds.has(edge.target),
        searchActive: !!searchQuery.trim()
      })
    ),
    data.nodes.map((node) =>
      React.createElement(GraphNode, {
        key: `${topology}-node-${node.id}`,
        node: node,
        isSelected: selectedNode?.id === node.id,
        isHighlighted: highlightedIds.has(node.id),
        isDimmed: searchQuery.trim() && !highlightedIds.has(node.id),
        onSelect: onSelectNode
      })
    )
  )
}
