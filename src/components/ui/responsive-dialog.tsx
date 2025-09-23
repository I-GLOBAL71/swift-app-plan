import * as React from "react"
import { cn } from "@/lib/utils";
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
  forceDialog?: boolean
}

export function ResponsiveDialog({ children, className, contentClassName, forceDialog, ...props }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  if (isMobile && !forceDialog) {
    return (
      <Drawer {...props}>
        <DrawerContent>
          <div className={cn("p-4", className, contentClassName)}>{children}</div>
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