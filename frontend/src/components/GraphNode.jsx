import React, { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Sphere } from "@react-three/drei"
import * as THREE from "three"

export default function GraphNode({ node, isSelected, isHighlighted, isDimmed, onSelect }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    if (isSelected) {
      meshRef.current.scale.setScalar(1.3 + Math.sin(time * 3) * 0.1)
    } else if (hovered) {
      meshRef.current.scale.setScalar(1.2)
    } else {
      meshRef.current.scale.setScalar(1)
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(isSelected ? null : node)
  }

  const baseSize = node.size * 0.5
  const color = new THREE.Color(node.color)
  const opacity = isDimmed ? 0.15 : 1

  return React.createElement("group", { position: [node.x, node.y, node.z] },
    React.createElement(Sphere, { args: [baseSize * 1.5, 16, 16] },
      React.createElement("meshBasicMaterial", { color: color, transparent: true, opacity: isSelected ? 0.3 : 0.1 })
    ),
    React.createElement("mesh", {
      ref: meshRef,
      onClick: handleClick,
      onPointerOver: (e) => { e.stopPropagation(); setHovered(true) },
      onPointerOut: () => setHovered(false)
    },
      React.createElement("sphereGeometry", { args: [baseSize, 32, 32] }),
      React.createElement("meshStandardMaterial", {
        color: color,
        emissive: color,
        emissiveIntensity: isSelected ? 1.5 : hovered ? 1 : 0.4,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: opacity
      })
    ),
    isSelected && React.createElement("mesh", { rotation: [Math.PI / 2, 0, 0] },
      React.createElement("ringGeometry", { args: [baseSize * 1.8, baseSize * 2.0, 64] }),
      React.createElement("meshBasicMaterial", { color: "#ffffff", transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    ),
    (hovered || isSelected) && !isDimmed && React.createElement(Html, { distanceFactor: 15, position: [0, baseSize * 2, 0], center: true },
      React.createElement("div", { className: "pointer-events-none select-none" },
        React.createElement("div", { className: "glass-strong rounded-lg px-3 py-2 text-center whitespace-nowrap" },
          React.createElement("p", { className: "text-sm font-semibold text-white" }, node.title),
          React.createElement("p", { className: "text-[10px] text-cyan-300 mt-0.5" }, node.cluster_name)
        )
      )
    )
  )
}
