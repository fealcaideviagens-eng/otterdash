import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Carlos Silva",
            role: "Trader Iniciante",
            text: "Finalmente consigo acompanhar minhas operações de forma organizada e sem usar Excel.",
        },
        {
            name: "Marina Costa",
            role: "Investidora",
            text: "Os alertas me salvaram várias vezes. Consigo tomar decisões mais rápidas e assertivas.",
        },
        {
            name: "João Santos",
            role: "Trader",
            text: "Sistema completo e gratuito! Perfeito para quem está começando e quer organizar suas operações.",
        },
    ];

    return (
        <section id="depoimentos" className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        O que nossos usuários dizem
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <Card key={i} className="shadow-modern">
                            <CardContent className="pt-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 fill-brand-blue text-brand-blue"
                                        />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    "{testimonial.text}"
                                </p>
                                <div>
                                    <div className="font-semibold">{testimonial.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
