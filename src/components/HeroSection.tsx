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
        <Link to="/planos">
          <Button variant="hero" className="animate-slide-up">
            Conhecer os planos
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
