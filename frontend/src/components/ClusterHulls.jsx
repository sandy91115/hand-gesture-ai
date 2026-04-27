import React, { useMemo } from "react"
import * as THREE from "three"

export default function ClusterHulls({ nodes, topology }) {
  const clusters = useMemo(() => {
    const groups = {}
    nodes.forEach(n => {
      if (!groups[n.cluster_id]) groups[n.cluster_id] = []
      groups[n.cluster_id].push(n)
    })

    return Object.entries(groups).map(([clusterId, clusterNodes]) => {
      if (clusterNodes.length < 2) return null

      const positions = clusterNodes.map(n => new THREE.Vector3(n.x, n.y, n.z))
      const center = new THREE.Vector3()
      positions.forEach(p => center.add(p))
      center.divideScalar(positions.length)

      let maxDist = 0
      positions.forEach(p => {
        maxDist = Math.max(maxDist, center.distanceTo(p))
      })

      const color = clusterNodes[0].color

      return {
        clusterId,
        center,
        radius: maxDist * 1.5,
        color,
        nodeCount: clusterNodes.length,
      }
    }).filter(Boolean)
  }, [nodes, topology])

  return React.createElement("group", null,
    clusters.map(c =>
      React.createElement("mesh", { key: `${topology}-${c.clusterId}`, position: [c.center.x, c.center.y, c.center.z] },
        React.createElement("icosahedronGeometry", { args: [c.radius, 2] }),
        React.createElement("meshBasicMaterial", {
          color: c.color,
          transparent: true,
          opacity: 0.05,
          wireframe: true,
          side: THREE.DoubleSide
        })
      )
    )
  )
}

