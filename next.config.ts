import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    // Docker/local build: não bloquear imagem por lint de componentes shadcn/ui.
    // Rode `npm run lint` separado no CI ou antes de commitar.
    ignoreDuringBuilds: true,
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
