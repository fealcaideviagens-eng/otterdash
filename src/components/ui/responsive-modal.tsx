import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer"

const ResponsiveModal = ({
    children,
    ...props
}: React.ComponentProps<typeof Dialog>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <Drawer {...props}>{children}</Drawer>
    }

    return <Dialog {...props}>{children}</Dialog>
}

const ResponsiveModalTrigger = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogTrigger>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <DrawerTrigger className={className} {...props}>
                {children}
            </DrawerTrigger>
        )
    }

    return (
        <DialogTrigger className={className} {...props}>
            {children}
        </DialogTrigger>
    )
}

const ResponsiveModalClose = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogClose>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <DrawerClose className={className} {...props}>
                {children}
            </DrawerClose>
        )
    }

    return (
        <DialogClose className={className} {...props}>
            {children}
        </DialogClose>
    )
}

const ResponsiveModalContent = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogContent>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <DrawerContent className={className} {...props}>
                {children}
            </DrawerContent>
        )
    }

    return (
        <DialogContent className={className} {...props}>
            {children}
        </DialogContent>
    )
}

const ResponsiveModalHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <DrawerHeader className={className} {...props} />
    }

    return <DialogHeader className={className} {...props} />
}

const ResponsiveModalFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <DrawerFooter className={className} {...props} />
    }

    return <DialogFooter className={className} {...props} />
}

const ResponsiveModalTitle = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogTitle>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <DrawerTitle className={className} {...props} />
    }

    return <DialogTitle className={className} {...props} />
}

const ResponsiveModalDescription = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogDescription>) => {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <DrawerDescription className={className} {...props} />
    }

    return <DialogDescription className={className} {...props} />
}

export {
    ResponsiveModal,
    ResponsiveModalTrigger,
    ResponsiveModalClose,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalFooter,
    ResponsiveModalTitle,
    ResponsiveModalDescription,
}
