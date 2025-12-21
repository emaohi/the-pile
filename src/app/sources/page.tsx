import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSources } from './actions'
import { AddLinkDialog } from './add-link-dialog'
import { AddTextDialog } from './add-text-dialog'
import { AddSourceDialog } from './add-source-dialog'
import { SourceList } from './source-list'

export default async function SourcesPage() {
  const sources = await getSources()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold mb-3 text-stone-900">Sources & Input</h1>
        <p className="text-lg text-stone-600 font-serif italic">
          Curate your information diet.
        </p>
      </div>

      <Tabs defaultValue="sources" className="space-y-8">
        <TabsList className="bg-stone-100 p-1 rounded-none border-b border-stone-200 w-full justify-start h-auto">
          <TabsTrigger 
            value="sources"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-serif text-lg"
          >
            Auto Sources
          </TabsTrigger>
          <TabsTrigger 
            value="manual"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 font-serif text-lg"
          >
            Add Manually
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          <div className="flex items-center justify-between bg-stone-50 p-6 border border-stone-200 rounded-sm">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Active Feeds</h2>
              <p className="text-stone-500 text-sm mt-1">Content fetched automatically on schedule</p>
            </div>
            <AddSourceDialog />
          </div>
          <SourceList sources={sources} />
        </TabsContent>

        <TabsContent value="manual" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-stone-900">Quick Add</h2>
              <p className="text-stone-600">
                Save individual items to your queue immediately.
              </p>
              <div className="flex flex-col gap-3">
                <AddLinkDialog />
                <AddTextDialog />
              </div>
            </div>
            
            <div className="bg-stone-50 p-6 border border-stone-200 rounded-sm h-fit">
              <h3 className="font-serif font-bold text-stone-900 mb-2">Coming Soon</h3>
              <ul className="space-y-2 text-stone-500 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                  Document Upload (PDF, EPUB)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                  Bulk CSV Import
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                  Browser Extension
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
