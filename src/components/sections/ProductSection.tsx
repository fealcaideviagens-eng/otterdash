import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart3,
    DollarSign,
    BookOpenText,
    Wallet,
    Skull,
    PiggyBank,
} from "lucide-react";

const ProductSection = () => {
    return (
        <section id="produto" className="py-20 bg-gray-100">
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
                    <Card className="rounded-3xl group bg-white border-none hover:border-transparent hover:bg-gradient-to-br hover:from-brand-blue hover:via-brand-blue-dark hover:to-[#1C2E51] hover:text-white hover:shadow-modern-lg transition-all duration-300">
                        <CardContent className="p-8">

                            <div className="rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300 w-16 h-16 flex items-center justify-center mb-4">
                                <BarChart3 className="w-7 h-7 text-white group-hover:text-brand-blue transition-colors duration-300" />
                            </div>

                            <h3 className="text-2xl font-semibold mb-2">
                                Dashboard intuitivo
                            </h3>

                            <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                Tenha visão geral de resultados de todas as suas operações
                            </p>

                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl group bg-white border-none hover:border-transparent hover:bg-gradient-to-br hover:from-brand-blue hover:via-brand-blue-dark hover:to-[#1C2E51] hover:text-white hover:shadow-modern-lg transition-all duration-300">
                        <CardContent className="p-8">

                            <div className="rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300 w-16 h-16 flex items-center justify-center mb-4">
                                <Wallet className="w-7 h-7 text-white group-hover:text-brand-blue transition-colors duration-300" />
                            </div>

                            <h3 className="text-2xl font-semibold mb-2">
                                Portfólio completo
                            </h3>

                            <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                Tenha acesso as suas operações abertas e as finalizadas com histórico completo
                            </p>

                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl group bg-white border-none hover:border-transparent hover:bg-gradient-to-br hover:from-brand-blue hover:via-brand-blue-dark hover:to-[#1C2E51] hover:text-white hover:shadow-modern-lg transition-all duration-300">
                        <CardContent className="p-8">

                            <div className="rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300 w-16 h-16 flex items-center justify-center mb-4">
                                <Skull className="w-7 h-7 text-white group-hover:text-brand-blue transition-colors duration-300" />
                            </div>

                            <h3 className="text-2xl font-semibold mb-2">
                                Analise de risco
                            </h3>

                            <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                Cadastre suas opções com ajuda de risco feita com IA
                            </p>

                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl group bg-white border-none hover:border-transparent hover:bg-gradient-to-br hover:from-brand-blue hover:via-brand-blue-dark hover:to-[#1C2E51] hover:text-white hover:shadow-modern-lg transition-all duration-300">
                        <CardContent className="p-8">

                            <div className="rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300 w-16 h-16 flex items-center justify-center mb-4">
                                <DollarSign className="w-7 h-7 text-white group-hover:text-brand-blue transition-colors duration-300" />
                            </div>

                            <h3 className="text-2xl font-semibold mb-2">
                                Simule sua saída
                            </h3>

                            <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                Antes de finalizar sua opção, simule seu lucro ou prejuízo
                            </p>

                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl group bg-white border-none hover:border-transparent hover:bg-gradient-to-br hover:from-brand-blue hover:via-brand-blue-dark hover:to-[#1C2E51] hover:text-white hover:shadow-modern-lg transition-all duration-300">
                        <CardContent className="p-8">

                            <div className="rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300 w-16 h-16 flex items-center justify-center mb-4">
                                <BookOpenText className="w-7 h-7 text-white group-hover:text-brand-blue transition-colors duration-300" />
                            </div>

                            <h3 className="text-2xl font-semibold mb-2">
                                Histórico de rentabilidade
                            </h3>

                            <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                Verifique o histórico de rentabilidade de suas opções
                            </p>

                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl group bg-white border-none hover:border-transparent hover:bg-gradient-to-br hover:from-brand-blue hover:via-brand-blue-dark hover:to-[#1C2E51] hover:text-white hover:shadow-modern-lg transition-all duration-300">
                        <CardContent className="p-8">

                            <div className="rounded-full bg-brand-blue group-hover:bg-white transition-colors duration-300 w-16 h-16 flex items-center justify-center mb-4">
                                <PiggyBank className="w-7 h-7 text-white group-hover:text-brand-blue transition-colors duration-300" />
                            </div>

                            <h3 className="text-2xl font-semibold mb-2">
                                Garantias em mãos
                            </h3>

                            <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                Tenha visão mês a mês dos seus resultados de forma consolidada
                            </p>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    );
};

export default ProductSection;
