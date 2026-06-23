'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

// Sonner toaster for admin/action feedback. richColors gives success/error their
// own semantic colors; closeButton + a generous duration make messages readable
// and dismissible (no one-second flash). Errors are kept longer per-call.
const SonnerToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      closeButton
      duration={5000}
      className="toaster group"
      toastOptions={{
        classNames: {
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { SonnerToaster }
