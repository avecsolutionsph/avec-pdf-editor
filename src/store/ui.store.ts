import { create } from 'zustand'

type Modal = 'password' | 'merge' | 'export' | 'signature' | null

interface UiState {
  sidebarOpen: boolean
  thumbnailPanelWidth: number
  propertiesPanelOpen: boolean
  activeModal: Modal
  zoom: number
  fitMode: 'width' | 'page' | 'custom'

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setThumbnailPanelWidth: (width: number) => void
  togglePropertiesPanel: () => void
  openModal: (modal: Modal) => void
  closeModal: () => void
  setZoom: (zoom: number) => void
  setFitMode: (mode: 'width' | 'page' | 'custom') => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  thumbnailPanelWidth: 220,
  propertiesPanelOpen: false,
  activeModal: null,
  zoom: 1,
  fitMode: 'width',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setThumbnailPanelWidth: (thumbnailPanelWidth) => set({ thumbnailPanelWidth }),
  togglePropertiesPanel: () => set((s) => ({ propertiesPanelOpen: !s.propertiesPanelOpen })),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
  setZoom: (zoom) => set({ zoom, fitMode: 'custom' }),
  setFitMode: (fitMode) => set({ fitMode }),
}))
