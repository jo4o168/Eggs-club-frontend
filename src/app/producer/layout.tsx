"use client";

import {ReactNode} from "react";
import ProtectedArea from "@/components/ProtectedArea";

export default function ProducerAreaLayout({children}: { children: ReactNode }) {
    return <ProtectedArea allow="producer">{children}</ProtectedArea>;
}
