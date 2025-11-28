import { Shield } from "lucide-react";

const Footer = () => {
    return (
        <footer className="py-12 bg-foreground text-background relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-dark/20 to-transparent"></div>
            <div className="container mx-auto px-4 relative">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold mb-4 text-white">Sobre</h3>
                        <p className="text-sm text-background/80">
                            Plataforma gratuita de gerenciamento de opções, criada por um investidor
                            para investidores. Atualmente em versão beta, focada em simplicidade
                            e eficiência para traders iniciantes.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4 text-white">Feedbacks & Doações</h3>
                        <p className="text-sm text-background/80 mb-2">
                            Feedbacks: otteropcoes@gmail.com
                        </p>
                        <p className="text-sm text-background/80">
                            PIX: otteropcoes@gmail.com
                        </p>
                    </div>
                </div>
                <div className="border-t border-background/20 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-white">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm">Site seguro</span>
                        </div>
                        <p className="text-sm text-background/60 text-center">
                            © 2025 Sistema de Opções. Todos os direitos reservados.
                        </p>
                        <p className="text-xs text-background/60 text-center max-w-lg">
                            Este sistema não fornece recomendações de compra ou venda de
                            opções.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
