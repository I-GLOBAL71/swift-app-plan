import * as React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

interface ResponsiveDialogProps extends React.ComponentProps<typeof Dialog> {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function ResponsiveDialog({ children, className, contentClassName, ...props }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer {...props}>
        <DrawerContent className={className}>
          <div className={contentClassName}>{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog {...props}>
      <DialogContent className={className}>
        <div className={contentClassName}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}