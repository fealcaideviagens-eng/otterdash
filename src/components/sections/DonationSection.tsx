import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CircleDollarSign } from "lucide-react";
import iconpix from "@/assets/icon-pix.png";

const DonationSection = () => {
    return (
        <section id="gratuito" className="py-20 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-[#1C2E51]">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4 text-white">Ajude a lontra a nadar mais rápido!</h2>
                    </div>
                    <div className="grid md:grid-cols-1 gap-8">

                        {/* Card de Doações */}
                        <Card className="bg-transparent border-2 border-white rounded-2xl max-w-4xl mx-auto">
                            <CardContent className="p-8">

                                {/* CONTAINER FLEX PRINCIPAL (NUNCA FECHE ANTES DO FIM) */}
                                <div className="flex flex-col md:flex-row items-center gap-8">

                                    {/* LADO ESQUERDO: Logo + Textos */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                        <img
                                            src={iconpix}
                                            alt="Logo PIX"
                                            className="w-20 h-20 object-contain mb-5"
                                            loading="lazy"
                                            width="80"
                                            height="80"
                                        />
                                        <p className="text-white text-lg font-medium">
                                            Qualquer valor ajuda
                                        </p>
                                        <p className="text-white text-xl mt-1">
                                            otteropcoes@gmail.com
                                        </p>
                                    </div>

                                    {/* Linha horizontal no mobile */}
                                    <div className="block md:hidden w-full h-px bg-white/60 my-3" />

                                    {/* Linha vertical no desktop */}
                                    <div className="hidden md:block w-px bg-white/60 h-full min-h-[160px]" />

                                    {/* LADO DIREITO: Título + Lista */}
                                    <div className="flex-1 text-left">
                                        <p className="text-left mb-3">
                                            <strong className="text-white text-lg">Por que doar?</strong>
                                        </p>
                                        <ul className="space-y-2 text-left">
                                            <li className="flex items-start gap-2 text-white">
                                                <CheckCircle className="w-5 h-5 text-[#4BB8A9] flex-shrink-0 mt-0.5" />
                                                <span>Novas funções insanas saindo do forno</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-white">
                                                <CheckCircle className="w-5 h-5 text-[#4BB8A9] flex-shrink-0 mt-0.5" />
                                                <span>Melhorias quase todo dia</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-white">
                                                <CheckCircle className="w-5 h-5 text-[#4BB8A9] flex-shrink-0 mt-0.5" />
                                                <span>Manutenção dos servidores (a lontra também paga boleto)</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-white">
                                                <CircleDollarSign className="w-5 h-5 text-[#CFF402] flex-shrink-0 mt-0.5" />
                                                <span>Já levantamos R$ 124,00 de traders que acreditam na visão!</span>
                                            </li>
                                        </ul>
                                    </div>

                                </div> {/* FECHA O FLEX AQUI NO FINAL */}

                            </CardContent>
                        </Card>

                        <p className="text-base text-muted-foreground max-w-3xl mx-auto text-center text-white">
                            Tudo que temos hoje é 100% grátis pra você. Criado por um investidor de opções.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DonationSection;
