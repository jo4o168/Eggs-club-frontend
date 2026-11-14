/**
 * Browser talks to the same origin (`/api`, `/storage`).
 * Next.js rewrites those paths to the backend container so AWS does not
 * depend on a baked IP or on port 8080 being open in the browser.
 */
export function getPublicApiUrl(): string {
    if (typeof window !== "undefined") {
        return "/api";
    }

    const configured = process.env.NEXT_PUBLIC_API_URL;
    if (configured && /^https?:\/\//.test(configured)) {
        return configured.replace(/\/$/, "");
    }

    return "http://backend:8000/api";
}

export function normalizePublicAssetUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith("data:")) return url;
    if (url.startsWith("/")) return url;

    try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith("/storage/") || parsed.pathname.startsWith("/api/")) {
            return `${parsed.pathname}${parsed.search}`;
        }
    } catch {
        return url;
    }

    return url;
}
