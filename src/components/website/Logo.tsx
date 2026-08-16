"use client";

import Link from "next/link";

export function Logo() {
    return (
    <>
        {/* Logo */}
        <div className="hidden items-center gap-2.5 group lg:flex w-36">
            <Link href="/" className="z-10" >
                <img src="/images/logo.jpg" alt="Azuretti Services" />
            </Link>
        </div>
        <div className="flex items-center gap-2.5 group lg:hidden w-9">
            <Link href="/" className="z-10">
                <img src="/images/icon.jpg" alt="Azuretti Services" />
            </Link>
        </div>
    </>
  );
}