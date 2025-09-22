// app/ui/loading-spinner.tsx

'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

const spinnerFade = keyframes`
    0% {
        background-color: currentColor;
    }
    100% {
        background-color: transparent;
    }
`;

const StyledSpinner = styled.div`
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
    color: inherit;

    .spinner-blade {
        position: absolute;
        /* Adjusted properties for a thicker look */
        left: 0.45em;      /* Changed from 0.4629em */
        bottom: 0;
        width: 0.1em;       /* Changed from 0.074em */
        height: 0.3em;      /* Changed from 0.2777em */
        border-radius: 0.05em; /* Changed from 0.0555em */
        background-color: transparent;
        transform-origin: center -0.2222em;
        animation: ${spinnerFade} 1s infinite linear;
    }

    /* Blade rotation and delay rules remain the same */
    .spinner-blade:nth-child(1) {
        animation-delay: 0s;
        transform: rotate(0deg);
    }
    .spinner-blade:nth-child(2) {
        animation-delay: 0.083s;
        transform: rotate(30deg);
    }
    .spinner-blade:nth-child(3) {
        animation-delay: 0.166s;
        transform: rotate(60deg);
    }
    .spinner-blade:nth-child(4) {
        animation-delay: 0.249s;
        transform: rotate(90deg);
    }
    .spinner-blade:nth-child(5) {
        animation-delay: 0.332s;
        transform: rotate(120deg);
    }
    .spinner-blade:nth-child(6) {
        animation-delay: 0.415s;
        transform: rotate(150deg);
    }
    .spinner-blade:nth-child(7) {
        animation-delay: 0.498s;
        transform: rotate(180deg);
    }
    .spinner-blade:nth-child(8) {
        animation-delay: 0.581s;
        transform: rotate(210deg);
    }
    .spinner-blade:nth-child(9) {
        animation-delay: 0.664s;
        transform: rotate(240deg);
    }
    .spinner-blade:nth-child(10) {
        animation-delay: 0.747s;
        transform: rotate(270deg);
    }
    .spinner-blade:nth-child(11) {
        animation-delay: 0.83s;
        transform: rotate(300deg);
    }
    .spinner-blade:nth-child(12) {
        animation-delay: 0.913s;
        transform: rotate(330deg);
    }
`;

export default function LoadingSpinner({ className }: { className?: string }) {
    const blades = Array.from({ length: 12 });

    return (
        <StyledSpinner className={className}>
            {blades.map((_, i) => (
                <div className="spinner-blade" key={i} />
            ))}
        </StyledSpinner>
    );
}