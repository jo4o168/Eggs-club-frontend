import React from "react";

type Props = {
    children: React.ReactNode
}
export default function DefaultLayout({children}: Props) {
    return (
        <div className={'min-h-screen flex w-full justify-center bg-gray-300'}>
            {children}
        </div>
    )
}