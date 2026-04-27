import React, { useRef } from "react"
import * as THREE from "three"

export default function GraphEdge({ edge, sourceNode, targetNode, isHighlighted, searchActive }) {
  const lineRef = useRef()

  if (!sourceNode || !targetNode) return null

  const points = [
    new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
    new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z),
  ]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const color = isHighlighted ? "#ffffff" : new THREE.Color(sourceNode.color).multiplyScalar(0.6)
  const opacity = searchActive && !isHighlighted ? 0.05 : isHighlighted ? 0.9 : 0.35
  const lineWidth = isHighlighted ? 2 : 1

  return React.createElement("line", { ref: lineRef, geometry: geometry },
    React.createElement("lineBasicMaterial", {
      color: color,
      transparent: true,
      opacity: opacity,
      linewidth: lineWidth,
    })
  )
}
