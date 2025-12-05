"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

interface UseNavegacionConGuardadoProps {
  tieneCambiosSinGuardar: boolean
  onGuardarAntesDeSalir: () => Promise<boolean>
  rutaActual: string
}

export function useNavegacionConGuardado({
  tieneCambiosSinGuardar,
  onGuardarAntesDeSalir,
  rutaActual
}: UseNavegacionConGuardadoProps) {
  const router = useRouter()
  const pathname = usePathname()
  const bloqueadoRef = useRef(false)

  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement

      if (!link || !tieneCambiosSinGuardar) return

      const href = link.getAttribute('href')
      if (!href || href === rutaActual) return

      if (href.startsWith('http') || href.startsWith('#')) return

      e.preventDefault()
      e.stopPropagation()

      if (bloqueadoRef.current) return
      bloqueadoRef.current = true

      const guardar = await onGuardarAntesDeSalir()
      
      if (guardar) {
        router.push(href)
      }

      bloqueadoRef.current = false
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [tieneCambiosSinGuardar, onGuardarAntesDeSalir, rutaActual, router])

  useEffect(() => {
    if (!tieneCambiosSinGuardar) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [tieneCambiosSinGuardar])
}

