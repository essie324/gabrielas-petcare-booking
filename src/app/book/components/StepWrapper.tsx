'use client'

import { useEffect, useState, ReactNode } from 'react'

export default function StepWrapper({
  children,
  stepKey,
}: {
  children: ReactNode
  stepKey: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(t)
  }, [stepKey])

  return (
    <div
      className={`transition-all duration-[220ms] ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  )
}
