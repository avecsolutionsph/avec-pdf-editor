import { Toolbar } from '../toolbar/Toolbar'
import { Sidebar } from './Sidebar'
import { ToolPanel } from './ToolPanel'
import { PdfViewer } from '../viewer/PdfViewer'
import { DropZone } from './DropZone'
import { useDocumentStore } from '../../store/document.store'

export function AppShell() {
  const { bytes } = useDocumentStore()

  return (
    <div className="flex flex-col h-full bg-white">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ToolPanel />
        <main className="flex flex-1 overflow-hidden">
          {bytes ? <PdfViewer /> : <DropZone />}
        </main>
      </div>
    </div>
  )
}
