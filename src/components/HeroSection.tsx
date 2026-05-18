import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container text-center">
        <h1 className="hero-title text-foreground mb-6 animate-fade-in">
          Ovos frescos da fazenda,
          <br />
          direto na sua porta.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
          Assine nosso clube e receba ovos caipiras de produtores locais com a
          frequência que desejar.
        </p>
        <div className="flex items-center justify-center gap-3 animate-slide-up">
          <Link to="/produtos">
            <Button variant="hero">
              Ver produtos
            </Button>
          </Link>
          <Link to="/planos">
            <Button variant="outline">
              Ver planos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
