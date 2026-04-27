import { create } from "zustand"

export const useAppStore = create((set, get) => ({
  // Theme
  theme: "dark",
  setTheme: (theme) => set({ theme }),

  // Camera presets
  cameraPresets: [],
  saveCameraPreset: (name, position) => {
    const presets = [...get().cameraPresets, { name, position: [...position] }]
    set({ cameraPresets: presets })
  },
  loadCameraPreset: (index) => get().cameraPresets[index],

  // UI panels
  showAnalytics: false,
  toggleAnalytics: () => set((s) => ({ showAnalytics: !s.showAnalytics })),

  showHulls: true,
  toggleHulls: () => set((s) => ({ showHulls: !s.showHulls })),

  showParticles: true,
  toggleParticles: () => set((s) => ({ showParticles: !s.showParticles })),

  showShortcuts: false,
  toggleShortcuts: () => set((s) => ({ showShortcuts: !s.showShortcuts })),

  // Screenshot
  lastScreenshot: null,
  setLastScreenshot: (dataUrl) => set({ lastScreenshot: dataUrl }),
}))

