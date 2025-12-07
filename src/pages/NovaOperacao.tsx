import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BrainCircuit, Zap } from "lucide-react"; // Icons as placeholders/fallback
import LontraCadastroRapido from "@/assets/lontracadastrorapido.png";
import LontraOtterInteligente from "@/assets/lontraotterinteligente.png";

export default function NovaOperacao() {
    const navigate = useNavigate();
    const [selectedFlow, setSelectedFlow] = useState<"smart" | "quick">("smart");

    const handleContinue = () => {
        if (selectedFlow === "smart") {
            navigate("/cadastro-opcao");
        } else {
            navigate("/cadastro-rapido");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">A Otter se adapta ao seu fluxo</h1>
                <p className="text-slate-600 mt-2">Escolha o melhor caminho para adicionar sua primeira operação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Otter Inteligente */}
                <Card
                    className={cn(
                        "relative cursor-pointer transition-all border-2 bg-white", // 1. Adicionado bg-white aqui
                        selectedFlow === "smart" ? "border-blue-600" : "border-transparent hover:border-slate-200" // 2. Removido o bg-blue-50/10 daqui
                    )}
                    onClick={() => setSelectedFlow("smart")}
                >
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="h-32 w-32 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img src={LontraOtterInteligente} alt="Otter Inteligente" className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-900">Otter inteligente</h3>
                                <div className={cn(
                                    "absolute top-6 right-6 h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                    selectedFlow === "smart" ? "border-blue-600" : "border-slate-300"
                                )}>
                                    {selectedFlow === "smart" && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Simule estratégias, compare cenários e valide riscos antes de operar com nossa IA.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Cadastro Rápido */}
                <Card
                    className={cn(
                        "relative cursor-pointer transition-all border-2 bg-white",
                        selectedFlow === "quick" ? "border-blue-600" : "border-transparent hover:border-slate-200"
                    )}
                    onClick={() => setSelectedFlow("quick")}
                >
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="h-32 w-32 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {/* Placeholder for Otter Image */}
                            <img src={LontraCadastroRapido} alt="Cadastro rápido" className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-900">Cadastro rápido</h3>
                                <div className={cn(
                                    "absolute top-6 right-6 h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                    selectedFlow === "quick" ? "border-blue-600" : "border-slate-300"
                                )}>
                                    {selectedFlow === "quick" && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Já operou? Pule a análise e registre os dados direto para seu controle.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Button
                size="lg"
                className="px-8 rounded-full"
                onClick={handleContinue}
            >
                Continuar
            </Button>
        </div>
    );
}
