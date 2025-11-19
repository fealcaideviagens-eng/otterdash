import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function DadosPessoais() {
    const { user } = useAuth();
    const [nome, setNome] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.user_metadata?.nome) {
            setNome(user.user_metadata.nome);
        }
    }, [user]);

    const handleSave = async () => {
        if (!nome.trim()) {
            toast.error("O nome não pode ser vazio.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { nome: nome }
            });

            if (error) throw error;

            toast.success("Nome atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar nome:", error);
            toast.error("Erro ao atualizar nome.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-sm font-medium text-muted-foreground">Minha conta</h1>
                <h2 className="text-3xl font-bold text-foreground">Dados pessoais</h2>
            </div>

            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center gap-4 pb-6 border-b">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Informações da conta</CardTitle>
                        <p className="text-sm text-muted-foreground">Visualize seus dados cadastrais</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="bg-slate-50"
                                    placeholder="Seu nome"
                                />
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-slate-50"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
