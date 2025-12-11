import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import lontralogin from "@/assets/lontra-login.png";

export default function EsqueciSenha() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            toast.success("Link de recuperação enviado! Verifique seu e-mail.");
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar link de recuperação");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-brand-blue via-brand-blue-dark to-[#1C2E51]">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>

            {/* Lado Esquerdo - Imagem da Lontra (oculto no mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-1">
                {/* Título sobreposto */}
                <div className="absolute bottom-[58%] left-16 z-10">
                    <h1 className="text-6xl font-bold text-[#EBDECE] leading-tight">
                        Otter ops
                    </h1>
                    <h1 className="text-4xl font-light text-[#EBDECE] leading-tight opacity-60">
                        bora ter controle!
                    </h1>
                </div>

                {/* Imagem */}
                <img
                    src={lontralogin}
                    alt="Lontra Login"
                    className="w-full h-auto object-contain max-h-screen"
                />
            </div>

            {/* Lado Direito - Card de Recuperação */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:pl-0 lg:pr-1 lg:py-1">
                <Card className="w-full max-w-md shadow-2xl drop-shadow-2xl glass">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Recuperar Senha
                        </CardTitle>
                        <CardDescription className="text-center">
                            Digite seu e-mail para receber o link de redefinição
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="default"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Enviando..." : "Recuperar senha"}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            <Link
                                to="/auth"
                                className="text-primary hover:underline"
                            >
                                Voltar para o Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
