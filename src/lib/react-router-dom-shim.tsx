"use client";

import LinkNext from "next/link";
import { useParams as useNextParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

type LinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Link({ to, children, className, onClick }: LinkProps) {
  return (
    <LinkNext href={to} className={className} onClick={onClick}>
      {children}
    </LinkNext>
  );
}

export function useNavigate() {
  const router = useRouter();

  return (to: string | { pathname: string; search?: string }, options?: { replace?: boolean }) => {
    const href = typeof to === "string" ? to : `${to.pathname}${to.search ?? ""}`;
    if (options?.replace) {
      router.replace(href);
      return;
    }
    router.push(href);
  };
}

export function useLocation() {
  const pathname = usePathname();
  const search = typeof window === "undefined" ? "" : window.location.search;
  return { pathname, search };
}

export function useParams<T extends Record<string, string>>() {
  return useNextParams() as T;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  }, [replace, router, to]);

  return null;
}
