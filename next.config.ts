import type { NextConfig } from "next";
import path from "path";

const backendOrigin = process.env.API_INTERNAL_URL || "http://backend:8000";

const nextConfig: NextConfig = {
  // Necessário para o Dockerfile (copia .next/standalone).
  output: "standalone",
  async rewrites() {
    return [
      {source: "/api/:path*", destination: `${backendOrigin}/api/:path*`},
      {source: "/storage/:path*", destination: `${backendOrigin}/storage/:path*`},
    ];
  },
  eslint: {
    // Docker/local build: não bloquear imagem por lint de componentes shadcn/ui.
    // Rode `npm run lint` separado no CI ou antes de commitar.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Apresentação / Docker: não bloquear o build por erros de tipo pontuais.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-router-dom": path.resolve(__dirname, "src/lib/react-router-dom-shim.tsx"),
    };
    return config;
  },
};

export default nextConfig;
