import React from "react"
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing"

export default function PostProcessing() {
  return React.createElement(EffectComposer, null,
    React.createElement(Bloom, {
      intensity: 0.6,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.9,
      mipmapBlur: true
    }),
    React.createElement(Vignette, {
      eskil: false,
      offset: 0.1,
      darkness: 0.6
    }),
    React.createElement(ToneMapping, {
      adaptive: true,
      resolution: 256,
      middleGrey: 0.6,
      maxLuminance: 16.0,
      averageLuminance: 1.0,
      adaptationRate: 1.0
    })
  )
}

