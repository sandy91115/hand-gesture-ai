import React, { useMemo } from "react"
import { BarChart3, GitBranch, Circle, Activity, TrendingUp, Layers } from "lucide-react"

export default function AnalyticsPanel({ nodes, edges, visible }) {
  const stats = useMemo(() => {
    if (!nodes || !nodes.length) return null

    const nodeCount = nodes.length
    const edgeCount = edges.length
    const density = nodeCount > 1 ? (edgeCount / (nodeCount * (nodeCount - 1) / 2)) : 0
    const avgConnections = nodeCount > 0 ? (edgeCount * 2 / nodeCount) : 0

    const clusterCounts = {}
    nodes.forEach(n => {
      clusterCounts[n.cluster_id] = (clusterCounts[n.cluster_id] || 0) + 1
    })
    const clusterCount = Object.keys(clusterCounts).length
    const sortedClusters = Object.entries(clusterCounts).sort((a, b) => b[1] - a[1])
    const largestCluster = sortedClusters[0]

    // Find most connected node
    const connectionCounts = {}
    edges.forEach(e => {
      connectionCounts[e.source] = (connectionCounts[e.source] || 0) + 1
      connectionCounts[e.target] = (connectionCounts[e.target] || 0) + 1
    })
    const mostConnected = Object.entries(connectionCounts).sort((a, b) => b[1] - a[1])[0]
    const mostConnectedNode = mostConnected ? nodes.find(n => n.id === parseInt(mostConnected[0])) : null

    return {
      nodeCount,
      edgeCount,
      density: density.toFixed(3),
      avgConnections: avgConnections.toFixed(1),
      clusterCount,
      largestClusterSize: largestCluster?.[1] || 0,
      mostConnected: mostConnectedNode ? `${mostConnectedNode.title} (${mostConnected[1]})` : "N/A"
    }
  }, [nodes, edges])

  if (!visible || !stats) return null

  return React.createElement("div", { className: "absolute top-20 right-4 z-20 glass rounded-xl p-4 w-60 space-y-3 animate-fade-in" },
    React.createElement("div", { className: "flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/30" },
      React.createElement(Activity, { className: "w-4 h-4 text-cyan-400" }),
      React.createElement("h3", { className: "text-sm font-bold text-white" }, "Graph Analytics")
    ),
    React.createElement(StatRow, { icon: Circle, label: "Nodes", value: stats.nodeCount }),
    React.createElement(StatRow, { icon: GitBranch, label: "Edges", value: stats.edgeCount }),
    React.createElement(StatRow, { icon: BarChart3, label: "Density", value: stats.density }),
    React.createElement(StatRow, { icon: TrendingUp, label: "Avg Degree", value: stats.avgConnections }),
    React.createElement(StatRow, { icon: Layers, label: "Clusters", value: `${stats.clusterCount} (max ${stats.largestClusterSize})` }),
    React.createElement(StatRow, { icon: Activity, label: "Hub Node", value: stats.mostConnected, small: true })
  )
}

function StatRow({ icon: Icon, label, value, small }) {
  return React.createElement("div", { className: "flex items-center justify-between text-xs" },
    React.createElement("div", { className: "flex items-center gap-2 text-slate-400" },
      React.createElement(Icon, { className: "w-3.5 h-3.5" }),
      React.createElement("span", null, label)
    ),
    React.createElement("span", { className: `font-mono font-semibold text-cyan-300 ${small ? "text-[10px] max-w-[100px] truncate" : ""}` }, value)
  )
}

