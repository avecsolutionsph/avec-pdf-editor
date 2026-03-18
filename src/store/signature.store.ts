import { create } from 'zustand'
import type { SignatureData, SignaturePlacement } from '../types/signature.types'

interface SignatureState {
  savedSignatures: SignatureData[]
  placements: SignaturePlacement[]
  pendingSignature: SignatureData | null  // signature waiting to be placed

  saveSignature: (sig: SignatureData) => void
  setPendingSignature: (sig: SignatureData | null) => void
  addPlacement: (placement: SignaturePlacement) => void
  removePlacement: (signatureId: string, pageIndex: number) => void
  clearPlacements: () => void
}

export const useSignatureStore = create<SignatureState>()((set) => ({
  savedSignatures: [],
  placements: [],
  pendingSignature: null,

  saveSignature: (sig) =>
    set((s) => ({ savedSignatures: [...s.savedSignatures, sig] })),

  setPendingSignature: (pendingSignature) => set({ pendingSignature }),

  addPlacement: (placement) =>
    set((s) => ({ placements: [...s.placements, placement] })),

  removePlacement: (signatureId, pageIndex) =>
    set((s) => ({
      placements: s.placements.filter(
        (p) => !(p.signatureId === signatureId && p.pageIndex === pageIndex)
      ),
    })),

  clearPlacements: () => set({ placements: [] }),
}))
