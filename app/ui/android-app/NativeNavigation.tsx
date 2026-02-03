'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

export default function NativeNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only run this listener on actual mobile devices, not in the web browser
        if (Capacitor.isNativePlatform()) {
            const backListener = App.addListener('backButton', (data) => {
                if (pathname === '/') {
                    // If on home page, exit app
                    App.exitApp();
                } else {
                    // Go back in history
                    router.back();
                }
            });

            return () => {
                backListener.then(handler => handler.remove());
            };
        }
    }, [pathname, router]);

    return null;
}