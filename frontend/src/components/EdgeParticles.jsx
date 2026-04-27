import React, { useRef, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

const PARTICLES_PER_EDGE = 2

export default function EdgeParticles({ edges, nodes, topology }) {
  const meshRefs = useRef({})

  const particles = useMemo(() => {
    const result = []
    edges.forEach((edge, edgeIdx) => {
      const src = nodes.find(n => n.id === edge.source)
      const tgt = nodes.find(n => n.id === edge.target)
      if (!src || !tgt) return

      for (let i = 0; i < PARTICLES_PER_EDGE; i++) {
        result.push({
          key: `${topology}-${edgeIdx}-${i}`,
          source: new THREE.Vector3(src.x, src.y, src.z),
          target: new THREE.Vector3(tgt.x, tgt.y, tgt.z),
          offset: i * 0.5 + Math.random() * 0.3,
          speed: 0.4 + Math.random() * 0.3,
          color: src.color,
        })
      }
    })
    return result
  }, [edges, nodes, topology])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    particles.forEach((p) => {
      const mesh = meshRefs.current[p.key]
      if (!mesh) return
      const t = ((time * p.speed + p.offset) % 1)
      mesh.position.lerpVectors(p.source, p.target, t)
      const scale = Math.sin(t * Math.PI) * 0.2 + 0.05
      mesh.scale.setScalar(scale)
    })
  })

  return React.createElement("group", null,
    particles.map((p) =>
      React.createElement("mesh", {
        key: p.key,
        ref: (el) => { if (el) meshRefs.current[p.key] = el }
      },
        React.createElement("sphereGeometry", { args: [0.06, 8, 8] }),
        React.createElement("meshBasicMaterial", {
          color: p.color,
          transparent: true,
          opacity: 0.7
        })
      )
    )
  )
}

