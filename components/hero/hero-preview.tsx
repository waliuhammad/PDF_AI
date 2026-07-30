"use client";

import { motion } from "framer-motion";
import { UploadPreview } from "./upload-preview";
import { AIStatus } from "./ai-status";


export function HeroPreview() {

    return (

        <motion.div
            initial={{
                opacity: 0,
                x: 40,
            }}
            animate={{
                opacity: 1,
                x: 0,
            }}
            transition={{
                duration: 0.8,
                delay: 0.2,
            }}
            className="
                relative
                flex
                w-full
                max-w-[620px]
                items-center
                justify-center
            "
        >


            {/* Background Glow */}

            <div
                className="
                    absolute
                    h-[520px]
                    w-[520px]
                    rounded-full
                    bg-[var(--primary)]/10
                    blur-[180px]
                "
            />



            {/* Floating AI Status */}

            <motion.div
                className="
                    absolute
                    -top-10
                    right-4
                    z-20
                "
                animate={{
                    y: [0, -8, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <AIStatus />
            </motion.div>



            {/* Main Upload Card */}

            <motion.div
                animate={{
                    y: [0, -8, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="
                    relative
                    z-10
                    w-full
                    max-w-lg
                "
            >

                <div
                    className="
                        rounded-[32px]
                        border
                        border-[var(--card-border)]
                        bg-[var(--card)]/80
                        backdrop-blur-xl
                        shadow-2xl
                        p-2
                    "
                >

                    <UploadPreview />

                </div>


            </motion.div>



            {/* Decorative Floating Dots */}

            <div
                className="
                    absolute
                    -bottom-8
                    left-10
                    h-3
                    w-3
                    rounded-full
                    bg-[var(--primary)]
                    opacity-60
                "
            />

            <div
                className="
                    absolute
                    top-20
                    -left-5
                    h-2
                    w-2
                    rounded-full
                    bg-[var(--primary)]
                    opacity-40
                "
            />


        </motion.div>

    );
}