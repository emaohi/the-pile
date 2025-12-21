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
import { Link, Bookmark } from 'lucide-react'
import { addLinkItem } from './actions'

export function AddLinkDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addLinkItem(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 h-auto py-4 flex flex-col gap-2 border-stone-200 hover:border-stone-400 hover:bg-stone-50">
          <Link className="h-6 w-6 text-stone-600" />
          <span className="font-serif text-lg">Save Link</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#FDFCFB] border-stone-200">
        <DialogHeader className="border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-100 rounded-full">
              <Bookmark className="h-5 w-5 text-stone-600" />
            </div>
            <DialogTitle className="font-serif text-2xl text-stone-900">Save to Queue</DialogTitle>
          </div>
          <DialogDescription className="text-stone-500 font-serif italic">
            Add an article or video to read later.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs uppercase tracking-wider text-stone-500 font-bold">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://..."
                required
                className="font-mono text-sm bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Article title"
                required
                className="font-serif text-lg bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="tags" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="AI, Design, Tech"
                  className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Personal Note</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Why is this interesting?"
                rows={3}
                className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200 resize-none"
              />
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