import { Toolbar } from '../toolbar/Toolbar'
import { Sidebar } from './Sidebar'
import { ToolPanel } from './ToolPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { PdfViewer } from '../viewer/PdfViewer'
import { DropZone } from './DropZone'
import { useDocumentStore } from '../../store/document.store'
import { useUiStore } from '../../store/ui.store'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

export function AppShell() {
  const { bytes } = useDocumentStore()
  const { propertiesPanelOpen } = useUiStore()

  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-full bg-white">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ToolPanel />
        <main className="flex flex-1 overflow-hidden">
          {bytes ? <PdfViewer /> : <DropZone />}
        </main>
        {bytes && propertiesPanelOpen && <PropertiesPanel />}
      </div>
    </div>
  )
}
