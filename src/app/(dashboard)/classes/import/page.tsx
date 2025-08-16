'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/classes')
  }, [router])

  return null
}