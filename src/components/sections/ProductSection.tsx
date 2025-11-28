import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart3,
    DollarSign,
    TrendingUp,
    Wallet,
    Skull,
    PiggyBank,
} from "lucide-react";

const ProductSection = () => {
    return (
        <section id="produto" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Por dentro da toca da lontra
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Recursos que todo mundo que lança call, put e trava precisava pra ontem.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                Dashboard intuitivo
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Tenha visão geral de resultados de todas as suas operações
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                Portfólio completo
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Tenha acesso as suas operações abertas e as finalizadas com histórico completo
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                                <Skull className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                Analise de risco
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Cadastre suas opções com ajuda de risco feita com IA
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                Simule sua saída
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Antes de finalizar sua opção, simule seu lucro ou prejuízo
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                Histórico de rentabilidade
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Tenha visão mês a mês dos seus resultados de forma consolidada
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#f5f5f5] hover:shadow-modern-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-brand-purple w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                                <PiggyBank className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                Garantias em mãos
                            </h3>
                            <p className="text-muted-foreground text-center">
                                Faça a gestão da sua própria garantia para não depender da corretora
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    );
};

export default ProductSection;
