import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/http";

export interface PublicProducer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  producerSetting?: {
    farm_name?: string | null;
    city?: string | null;
    state?: string | null;
    description?: string | null;
  } | null;
}

export interface PublicPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  frequency: number;
  is_featured: boolean;
  is_active?: boolean;
  producer_id: number;
}

export interface PublicProduct {
  id: number;
  name: string;
  egg_size?: string | null;
  egg_color?: string | null;
  kit_quantity?: number | null;
  one_time_price?: number | null;
  subscription_price?: number | null;
  allow_subscription?: boolean;
  allow_one_time_purchase?: boolean;
  image_url?: string | null;
  producer_id: number;
}

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

function normalizeImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  const apiBaseUrl = getApiBaseUrl();
  const apiBase = new URL(apiBaseUrl);

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const current = new URL(url);
      const hasDefaultLocalhostOrigin =
        current.hostname === "localhost" &&
        (current.port === "" || current.port === "80");
      if (hasDefaultLocalhostOrigin) {
        current.protocol = apiBase.protocol;
        current.host = apiBase.host;
        return current.toString();
      }
    } catch {
      // no-op
    }
    return url;
  }

  if (url.startsWith("/")) return `${apiBaseUrl}${url}`;
  return `${apiBaseUrl}/${url}`;
}

export const usePublicProducers = () =>
  useQuery({
    queryKey: ["public-producers"],
    queryFn: () => api.get<PublicProducer[]>("/public/producers"),
  });

export const usePublicProducer = (id?: string) =>
  useQuery({
    queryKey: ["public-producer", id],
    queryFn: () => api.get<PublicProducer>(`/public/producers/${id}`),
    enabled: !!id,
  });

export const usePublicPlans = (producerId?: string) =>
  useQuery({
    queryKey: ["public-plans", producerId],
    queryFn: () =>
      api.get<PublicPlan[]>(
        producerId ? `/public/subscription-plans?producer_id=${producerId}` : "/public/subscription-plans",
      ),
  });

export const usePublicProducts = (producerId?: string) =>
  useQuery({
    queryKey: ["public-products", producerId],
    queryFn: async () => {
      const products = await api.get<PublicProduct[]>(
        producerId ? `/public/products?producer_id=${producerId}` : "/public/products",
      );
      return products.map((product) => ({
        ...product,
        image_url: normalizeImageUrl(product.image_url),
      }));
    },
  });
