import React, { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const Header: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 120) setHidden(true)
    else setHidden(false)
  })

  const nav = [
    { label: 'Recursos', id: 'features' },
    { label: 'Preços', id: 'pricing' },
    { label: 'FAQ', id: 'faq' }
  ]

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 rounded-2xl bg-[#0b0b0b]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0b0b]/60">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => go('top')} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-extrabold text-sm">T</div>
              <span className="font-semibold tracking-tight">TubeFlow</span>
            </button>

            <nav className="hidden md:flex items-center gap-8">
              {nav.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} className="text-sm text-white/80 hover:text-white">
                  {n.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:block">
              <button onClick={() => go('pricing')} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
                Get Started
              </button>
            </div>

            <button className="md:hidden rounded-lg p-2 hover:bg-white/5" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{ open: { height: 'auto', opacity: 1 }, closed: { height: 0, opacity: 0 } }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {nav.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} className="rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/5">
                  {n.label}
                </button>
              ))}
              <button onClick={() => go('pricing')} className="mt-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black">
                Get Started
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
