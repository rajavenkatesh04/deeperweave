'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

export default function ImageModal({
                                       imageUrl,
                                       onClose
                                   }: {
    imageUrl: string;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-lg z-90 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[60] p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>

                {/* Image */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full h-full max-w-5xl max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
                >
                    <Image
                        src={imageUrl}
                        alt="Timeline entry photo"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}