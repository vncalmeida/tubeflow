import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle2, XCircle, Building2, Calendar, Rocket, ArrowRight } from 'lucide-react'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'userExists' | 'passwordValid' | 'companyLink' | 'companyActive' | 'subscriptionValid'
  status: 'loading' | 'success' | 'error'
  message?: string
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 }
}

const icons = {
  userExists: AlertCircle,
  passwordValid: AlertCircle,
  companyLink: Building2,
  companyActive: Rocket,
  subscriptionValid: Calendar
}

const titles = {
  userExists: 'Verificação de Usuário',
  passwordValid: 'Validação de Senha',
  companyLink: 'Vínculo Empresarial',
  companyActive: 'Status da Empresa',
  subscriptionValid: 'Validade da Assinatura'
}

const getEnhancedMessage = (type: string, originalMessage: string) => {
  if (originalMessage.includes('não possui um plano')) {
    return {
      title: 'Ative sua empresa agora',
      message: 'Sua empresa ainda não possui um plano ativo. Desbloqueie recursos e benefícios:',
      benefits: [
        'Acesso completo às funcionalidades',
        'Suporte prioritário',
        'Gestão avançada e automações',
        'Relatórios e análises em tempo real',
        'Integrações com outras ferramentas'
      ],
      cta: {
        text: 'Ativar empresa',
        subtext: 'Escolha o plano ideal'
      }
    }
  }
  if (originalMessage.includes('expirada')) {
    return {
      title: 'Renove sua assinatura',
      message: 'Sua assinatura expirou. Evite interrupções e mantenha o acesso premium:',
      benefits: [
        'Preserve dados e configurações',
        'Acesso contínuo às funcionalidades',
        'Sem pausas no trabalho da equipe',
        'Continuidades dos projetos',
        'Suporte e atualizações'
      ],
      cta: {
        text: 'Renovar assinatura',
        subtext: 'Continue aproveitando tudo'
      }
    }
  }
  return null
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  type,
  status,
  message
}) => {
  const Icon = icons[type]
  const enhancedMessage = message ? getEnhancedMessage(type, message) : null
  const showPlansButton = (type === 'companyActive' || type === 'subscriptionValid') && status === 'error'

  const handleViewPlans = () => {
    window.location.href = 'https://tubeflow10x.com/#plan'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -inset-[1px] rounded-2xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.18),transparent)] pointer-events-none" />

              <div className="relative rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="p-6 sm:p-7">
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl p-3 bg-white/10 ring-1 ring-white/10">
                      <Icon className="h-6 w-6 text-white/90" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                      {enhancedMessage ? enhancedMessage.title : titles[type]}
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {!enhancedMessage ? (
                      <div
                        className={
                          'flex items-center gap-3 rounded-xl p-4 ring-1 ' +
                          (status === 'loading'
                            ? 'bg-white/5 ring-white/10'
                            : status === 'success'
                            ? 'bg-emerald-500/10 ring-emerald-400/30'
                            : 'bg-rose-500/10 ring-rose-400/30')
                        }
                      >
                        {status === 'loading' && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                        )}
                        {status === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        {status === 'error' && <XCircle className="h-5 w-5 text-rose-400" />}
                        <p
                          className={
                            'text-sm ' +
                            (status === 'loading'
                              ? 'text-white/80'
                              : status === 'success'
                              ? 'text-emerald-300'
                              : 'text-rose-300')
                          }
                        >
                          {message || 'Verificando...'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <p className="text-white/80 text-center">{enhancedMessage.message}</p>

                        <div className="space-y-3">
                          {enhancedMessage.benefits.map((b: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-white/90">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 text-white/70" />
                              <span className="text-sm text-white/80">{b}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleViewPlans}
                            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 font-semibold text-black transition hover:bg-white/90"
                          >
                            <span>{enhancedMessage.cta.text}</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </button>
                          <p className="mt-3 text-center text-xs text-white/60">{enhancedMessage.cta.subtext}</p>
                        </div>
                      </div>
                    )}

                    {showPlansButton && !enhancedMessage && (
                      <div className="pt-1">
                        <button
                          onClick={handleViewPlans}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-medium text-white hover:bg-white/15 ring-1 ring-white/10 transition"
                        >
                          <span>Ver planos</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default VerificationModal
