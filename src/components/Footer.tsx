import { Link } from "react-router-dom";
import BrandTitle from "./BrandTitle";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary py-10 mt-auto border-t">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <BrandTitle className="text-xl md:text-xl" iconClassName="w-5 h-5 md:w-5 md:h-5" />
            <p className="text-sm text-muted-foreground">
              Conectando clientes e produtores de ovos frescos.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Site</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kits de ovos
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Planos de assinatura
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
            © {currentYear} Egg's Club. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
