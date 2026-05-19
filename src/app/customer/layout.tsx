"use client";

import {ReactNode} from "react";
import ProtectedArea from "@/components/ProtectedArea";

export default function CustomerAreaLayout({children}: { children: ReactNode }) {
    return <ProtectedArea allow="customer">{children}</ProtectedArea>;
}
