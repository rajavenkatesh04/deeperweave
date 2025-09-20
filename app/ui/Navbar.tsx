'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

// You can customize these navigation links
const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                            Liv
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="font-medium text-gray-700 transition-colors duration-200 hover:text-pink-600 dark:text-zinc-300 dark:hover:text-pink-400"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Sign In Button & Mobile Menu Button */}
                    <div className="flex items-center">
                        <div className="hidden md:block">
                            <Link href="/auth/login" className="rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700">
                                Sign In
                            </Link>
                        </div>
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                type="button"
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                                aria-controls="mobile-menu"
                                aria-expanded={isOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {isOpen ? (
                                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={clsx("md:hidden", { 'block': isOpen, 'hidden': !isOpen })} id="mobile-menu">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)} // Close menu on link click
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                        <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-pink-600 dark:text-pink-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}