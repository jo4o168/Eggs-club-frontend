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

  return (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname };
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
