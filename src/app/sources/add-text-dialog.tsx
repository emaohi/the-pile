'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { FileText, PenTool } from 'lucide-react'
import { addTextItem } from './actions'

export function AddTextDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addTextItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 h-auto py-4 flex flex-col gap-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50">
          <FileText className="h-6 w-6 text-stone-600" />
          <span className="font-serif text-lg">Paste Text</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#FDFCFB] border-stone-200">
        <DialogHeader className="border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-100 rounded-full">
              <PenTool className="h-5 w-5 text-stone-600" />
            </div>
            <DialogTitle className="font-serif text-2xl text-stone-900">Capture Text</DialogTitle>
          </div>
          <DialogDescription className="text-stone-500 font-serif italic">
            Save a snippet, quote, or idea for later processing.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Give this content a title"
                required
                className="font-serif text-lg bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Paste your content here..."
                rows={8}
                required
                className="font-serif text-base leading-relaxed bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attribution" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Attribution</Label>
                <Input
                  id="attribution"
                  name="attribution"
                  placeholder="Author or source"
                  className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="AI, Design"
                  className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-stone-900 text-stone-50 hover:bg-stone-800 font-serif text-lg py-6">
              Add to Queue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}