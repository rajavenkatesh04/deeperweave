import { Playwrite_NZ,  DM_Serif_Display, Geist, Belanosima, Playfair_Display } from "next/font/google"

export const PlayWriteNewZealandFont = Playwrite_NZ({
    weight: ['400'],
})

export const BelanosimaFont = Belanosima({
    subsets: ['latin'],
    weight: ['400', '700'],
})

export const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700'],
});


export const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
    display: 'swap',
});

export const dmSerif = DM_Serif_Display({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-dm-serif',
    display: 'swap',
});