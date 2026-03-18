import { useState } from 'react'
import { Toolbar } from '../toolbar/Toolbar'
import { Sidebar } from './Sidebar'
import { ToolPanel } from './ToolPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { PdfViewer } from '../viewer/PdfViewer'
import { DropZone } from './DropZone'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useFormFields } from '../../hooks/useFormFields'
import { SignatureModal } from '../signature/SignatureModal'
import type { DetectedFont } from '../../services/font-detection.service'

export function AppShell() {
  const { bytes } = useDocumentStore()
  const { propertiesPanelOpen, activeModal } = useUiStore()
  const [activeFont, setActiveFont] = useState<DetectedFont | null>(null)

  useKeyboardShortcuts()
  useFormFields()

  return (
    <div className="flex flex-col h-full bg-white">
      <Toolbar activeFont={activeFont} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ToolPanel />
        <main className="flex flex-1 overflow-hidden">
          {bytes
            ? <PdfViewer onActiveFont={setActiveFont} />
            : <DropZone />
          }
        </main>
        {bytes && propertiesPanelOpen && <PropertiesPanel />}
      </div>

      {activeModal === 'signature' && <SignatureModal />}
    </div>
  )
}
