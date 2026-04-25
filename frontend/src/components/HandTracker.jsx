import React, { useEffect, useRef, useState, useCallback } from 'react'

export default function HandTracker({ enabled, onGesture, onSelectNode, topology }) {
  const videoRef = useRef()
  const canvasRef = useRef()
  const handsRef = useRef()
  const cameraRef = useRef()
  const gestureState = useRef({ lastGesture: null, gestureStart: 0, lastSwitchTime: 0 })
  const [cameraReady, setCameraReady] = useState(false)

  const processLandmarks = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) return null

    const hand = landmarks[0]
    const wrist = hand[0]
    const thumbTip = hand[4]
    const indexTip = hand[8]
    const middleTip = hand[12]
    const ringTip = hand[16]
    const pinkyTip = hand[20]

    const isFingerExtended = (tip, pip) => tip.y < pip.y
    const isFingerCurled = (tip, pip) => tip.y > pip.y

    const indexExt = isFingerExtended(indexTip, hand[6])
    const middleExt = isFingerExtended(middleTip, hand[10])
    const ringExt = isFingerExtended(ringTip, hand[14])
    const pinkyExt = isFingerExtended(pinkyTip, hand[18])

    const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y)
    const isPinching = pinchDist < 0.05

    if (indexExt && middleExt && !ringExt && !pinkyExt) return 'zoom_in'
    if (indexExt && middleExt && ringExt && pinkyExt) return 'rotate'
    if (isPinching) return 'select'
    if (!indexExt && !middleExt && !ringExt && !pinkyExt) return 'reset'

    const now = Date.now()
    if (now - gestureState.current.lastSwitchTime > 800) {
      if (wrist.x < 0.3 || wrist.x > 0.7) {
        gestureState.current.lastSwitchTime = now
        return 'switch_topology'
      }
    }

    return null
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (cameraRef.current) {
        cameraRef.current.stop()
        cameraRef.current = null
      }
      setCameraReady(false)
      return
    }

    if (!window.Hands || !window.Camera) {
      console.warn('MediaPipe not loaded from CDN')
      return
    }

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    })

    hands.onResults((results) => {
      if (!canvasRef.current) return
      const canvasCtx = canvasRef.current.getContext('2d')
      canvasCtx.save()
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height)

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          for (const lm of landmarks) {
            canvasCtx.beginPath()
            canvasCtx.arc(lm.x * canvasRef.current.width, lm.y * canvasRef.current.height, 3, 0, 2 * Math.PI)
            canvasCtx.fillStyle = '#00aaff'
            canvasCtx.fill()
          }

          const gesture = processLandmarks(results.multiHandLandmarks)
          if (gesture && gesture !== gestureState.current.lastGesture) {
            gestureState.current.lastGesture = gesture
            onGesture(gesture)

            if (gesture === 'select') {
              const indexTip = landmarks[8]
              const x = indexTip.x
              const y = indexTip.y
              if (x > 0.45 && x < 0.55 && y > 0.45 && y < 0.55) {
                // Selection would happen via raycast in full implementation
              }
            }
          }
        }
      }
      canvasCtx.restore()
    })

    handsRef.current = hands

    if (videoRef.current) {
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current })
        },
        width: 320,
        height: 240,
      })
      camera.start().then(() => setCameraReady(true))
      cameraRef.current = camera
    }

    return () => {
      if (cameraRef.current) cameraRef.current.stop()
    }
  }, [enabled, onGesture, processLandmarks])

  if (!enabled) return null

  return React.createElement('div', { className: 'absolute bottom-4 right-4 z-30' },
    React.createElement('div', { className: 'relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80 shadow-2xl' },
      React.createElement('video', { ref: videoRef, className: 'hidden', playsInline: true }),
      React.createElement('canvas', { ref: canvasRef, width: 240, height: 180, className: 'rounded-xl' }),
      !cameraReady && React.createElement('div', { className: 'absolute inset-0 flex items-center justify-center bg-slate-900/90' },
        React.createElement('p', { className: 'text-xs text-slate-500' }, 'Starting camera...')
      ),
      React.createElement('div', { className: 'absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/70 text-[10px] text-cyan-400 font-mono' }, 'Hand Tracking')
    )
  )
}
