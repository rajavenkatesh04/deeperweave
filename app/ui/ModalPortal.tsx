// app/ui/ModalPortal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Optional: Lock body scroll when any modal is active
        // document.body.style.overflow = 'hidden';
        // return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // While loading on server or hydrating, render nothing
    if (!mounted) return null;

    // "Teleport" the children to the <body> tag, escaping all stacking contexts
    return createPortal(children, document.body);
}