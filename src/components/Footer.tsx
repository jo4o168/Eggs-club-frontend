import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-display font-semibold text-primary">
              Egg's Club
            </h3>
            <p className="text-sm text-muted-foreground">
              Conectando você aos melhores produtores de ovos caipiras da região.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/produtores" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Produtores
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Para Produtores</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cadastre-se
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Acessar painel
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                contato@eggsclub.com.br
              </li>
              <li className="text-sm text-muted-foreground">
                (11) 99999-9999
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Egg's Club. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
