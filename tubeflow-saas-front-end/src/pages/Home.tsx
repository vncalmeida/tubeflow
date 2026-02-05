import React from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { Check, Sparkles, BarChart2, Users, Shield, Zap, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-[#0b0b0b] text-white min-h-screen">
      <Header />

      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Transforme seu Canal do YouTube em uma
                <span className="block">Máquina de Produção de Conteúdo</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-white/70 max-w-xl">
                Pare de malabarismo com planilhas e apps de chat. Gerencie todo
                o seu fluxo de produção em um só lugar e publique 2x mais, com menos estresse.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <button onClick={() => scrollTo('features')} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                  Ver recursos <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="-space-x-3 flex">
                  {[
                    'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
                    'https://api.dicebear.com/9.x/thumbs/svg?seed=bob',
                    'https://api.dicebear.com/9.x/thumbs/svg?seed=carol',
                    'https://api.dicebear.com/9.x/thumbs/svg?seed=dave',
                    'https://api.dicebear.com/9.x/thumbs/svg?seed=erika'
                  ].map((src, i) => (
                    <img key={i} src={src} alt="avatar" className="h-9 w-9 rounded-full ring-2 ring-[#0b0b0b] bg-white" />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-sm text-white/70">1000+ criadores fazendo seus canais crescerem</div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-[720px] mx-auto"
              >
                <div className="relative bg-white/5 ring-1 ring-white/10 overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] [border-radius:58%_42%_60%_40%/55%_45%_55%_45%]">
                  <img
                    src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1920&q=80"
                    alt="painel"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
              <Sparkles className="w-4 h-4" /> Recursos
            </div>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold">Projeto moderno, foco no essencial</h2>
            <p className="mt-4 text-white/70">Uma plataforma que unifica time, processos e métricas em um fluxo só.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Orquestração de Time', desc: 'Pessoas certas, na hora certa, com o contexto certo.' },
              { icon: BarChart2, title: 'KPIs Visuais', desc: 'Acompanhe alcance, retenção e conversão rapidamente.' },
              { icon: Shield, title: 'Segurança Primeiro', desc: 'Backups, controle de acesso e trilhas de auditoria.' },
              { icon: Zap, title: 'Automatizações', desc: 'Menos tarefas manuais, mais velocidade de entrega.' },
              { icon: Check, title: 'Fluxo de Produção', desc: 'Da ideia à publicação em etapas claras e rastreáveis.' },
              { icon: Sparkles, title: 'UX Leve', desc: 'Interface minimalista que dá destaque ao conteúdo.' }
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 hover:bg-white/[.08] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl p-3 bg-white/10">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{f.title}</h3>
                    <p className="mt-2 text-white/70">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold">Preços simples</h2>
            <p className="mt-4 text-white/70">Sem letras miúdas. Cancele quando quiser.</p>
          </div>

          <div className="mt-14 grid lg:grid-cols-3 gap-6">
            {[{ name: 'Starter', price: 'R$ 49/mês', perks: ['Até 2 canais', 'Fluxo básico', 'Relatórios essenciais'] }, { name: 'Pro', price: 'R$ 149/mês', perks: ['Até 10 canais', 'Automatizações', 'Equipe e permissões'] }, { name: 'Scale', price: 'Fale com a gente', perks: ['Canais ilimitados', 'SLA e onboarding', 'Integrações avançadas'] }].map((p, i) => (
              <div key={p.name} className={`rounded-2xl p-6 ring-1 ring-white/10 ${i === 1 ? 'bg-white text-black' : 'bg-white/5'}`}>
                <div className="flex items-baseline justify-between">
                  <h3 className={`text-2xl font-bold ${i === 1 ? 'text-black' : ''}`}>{p.name}</h3>
                  {i === 1 && <span className="text-xs px-2 py-1 rounded-full bg-black text-white">Mais popular</span>}
                </div>
                <div className={`mt-4 text-3xl font-extrabold ${i === 1 ? 'text-black' : ''}`}>{p.price}</div>
                <div className="mt-6 grid gap-3">
                  {p.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-md p-1.5 ${i === 1 ? 'bg-black/10' : 'bg-white/10'}`}></div>
                      <span className={`${i === 1 ? 'text-black/80' : 'text-white/80'}`}>{perk}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => scrollTo('cta')} className={`mt-8 w-full rounded-xl py-3 font-semibold ${i === 1 ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90'}`}>Começar</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-5xl font-extrabold text-center">FAQ</h3>
          <div className="mt-10 divide-y divide-white/10 rounded-2xl bg-white/5 ring-1 ring-white/10">
            {[
              { q: 'Posso cancelar quando quiser?', a: 'Sim. Você usa até o fim do período já pago e pronto.' },
              { q: 'Como é o suporte?', a: 'Atendimento humano por e-mail e WhatsApp, com prioridade para incidentes.' }
            ].map((item, i) => (
              <details key={i} className="group p-6 open:bg-white/[.06]">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-6">
                  <span className="text-lg font-semibold">{item.q}</span>
                  <span className="text-xs px-2 py-1 rounded-md bg-white/10">ver</span>
                </summary>
                <p className="mt-3 text-white/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="py-24 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 p-10 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="absolute -z-10 inset-0 bg-[radial-gradient(50%_60%_at_50%_40%,rgba(255,255,255,.12),transparent)]" />
            <h3 className="text-3xl sm:text-4xl font-extrabold">Pronto para acelerar sua produção?</h3>
            <p className="mt-3 text-white/70">Comece hoje mesmo e sinta a diferença na primeira semana.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/553186461665?text=Olá!" target="_blank" rel="noreferrer" className="rounded-2xl bg-white/10 px-6 py-3.5 font-semibold hover:bg-white/15">Falar com especialista</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
