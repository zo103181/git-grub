import { createPortal } from 'react-dom'

export default function MobileActionsPortal({ children }: { children: React.ReactNode }) {
    if (typeof document === 'undefined') return null
    return createPortal(children, document.body)
}