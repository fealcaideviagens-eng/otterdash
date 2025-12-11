import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
    ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Check } from "lucide-react";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToPortfolio: () => void;
    onAddAnother: () => void;
}

export const SuccessModal = ({
    isOpen,
    onClose,
    onGoToPortfolio,
    onAddAnother,
}: SuccessModalProps) => {
    return (
        <ResponsiveModal open={isOpen} onOpenChange={onClose}>
            <ResponsiveModalContent className="sm:max-w-md">
                <ResponsiveModalHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <ResponsiveModalTitle className="text-xl font-bold text-slate-900">
                        Operação adicionada com sucesso
                    </ResponsiveModalTitle>
                </ResponsiveModalHeader>

                <div className="px-4 sm:px-0 py-0">
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Pode levar alguns minutos até que ela apareça em seu portfólio.
                    </p>
                </div>

                <Separator className="my-2" />

                <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="w-full rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={onGoToPortfolio}
                    >
                        Ir para Portfólio
                    </Button>
                    <Button
                        className="w-full rounded-full bg-brand-blue-dark hover:bg-brand-blue text-white"
                        onClick={onAddAnother}
                    >
                        Adicionar outra opção
                    </Button>
                </ResponsiveModalFooter>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
};
