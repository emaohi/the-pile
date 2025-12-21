'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Rss } from 'lucide-react'
import { addSource } from './actions'

export function AddSourceDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await addSource(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-stone-900 text-stone-50 hover:bg-stone-800 font-serif px-6">
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#FDFCFB] border-stone-200">
        <DialogHeader className="border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-100 rounded-full">
              <Rss className="h-5 w-5 text-stone-600" />
            </div>
            <DialogTitle className="font-serif text-2xl text-stone-900">New Source</DialogTitle>
          </div>
          <DialogDescription className="text-stone-500 font-serif italic">
            Connect a blog or channel to auto-fetch content.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Source URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://simonwillison.net or YouTube channel"
                required
                className="font-mono text-sm bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Display Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Simon's Blog"
                  required
                  className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interval" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Check Frequency</Label>
                <Select name="interval" defaultValue="daily">
                  <SelectTrigger className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-sm border border-stone-100 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topicFilter" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Topic Filter (Optional)</Label>
                <Input
                  id="topicFilter"
                  name="topicFilter"
                  placeholder="AI, LLMs, Claude"
                  className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
                />
                <p className="text-[10px] text-stone-400 font-serif italic">
                  Only queue items matching these keywords.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoTags" className="text-xs uppercase tracking-wider text-stone-500 font-bold">Auto-Tags</Label>
                <Input
                  id="autoTags"
                  name="autoTags"
                  placeholder="tech, reading"
                  className="bg-white border-stone-200 focus:border-stone-400 focus:ring-stone-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-stone-900 text-stone-50 hover:bg-stone-800 font-serif text-lg py-6">
              Add Source
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}