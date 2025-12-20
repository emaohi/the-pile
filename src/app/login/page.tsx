'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Invalid password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] relative overflow-hidden">
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative stacked layers - representing "the pile" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48">
        <div className="absolute inset-0 bg-[#E8E4DF] rounded-sm transform rotate-[-4deg] translate-y-4 translate-x-2" />
        <div className="absolute inset-0 bg-[#EFEBE6] rounded-sm transform rotate-[2deg] translate-y-2 translate-x-1" />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="bg-white rounded-sm shadow-[0_2px_40px_rgba(0,0,0,0.06)] border border-[#E8E4DF] p-10">
          {/* Brand */}
          <div className="text-center mb-10">
            <h1
              className="text-3xl tracking-tight text-[#1A1A1A] mb-1"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
            >
              thePile
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase text-[#8C8680]">
              Learning System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-12 bg-[#FAF9F7] border-[#E8E4DF] text-[#1A1A1A] placeholder:text-[#B5B0A9] focus:border-[#1A1A1A] focus:ring-0 rounded-sm transition-colors"
              />
              {error && (
                <p className="text-xs text-[#C45C4A] pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-sm font-normal tracking-wide transition-all duration-200 disabled:opacity-40"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Entering...
                </span>
              ) : (
                'Enter'
              )}
            </Button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center mt-6 text-[10px] tracking-[0.15em] uppercase text-[#B5B0A9]">
          Turn reading into learning
        </p>
      </div>
    </div>
  )
}
