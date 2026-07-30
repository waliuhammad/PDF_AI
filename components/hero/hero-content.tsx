"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { FeatureBadges } from "./feature-badges";


export function HeroContent() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
        >

            {/* Badge */}

            <div
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[var(--card-border)]
                    bg-[var(--card)]
                    px-4
                    py-2
                "
            >

                <Sparkles
                    size={16}
                    className="text-[var(--primary)]"
                />

                <span className="text-sm font-medium text-fg">
                    AI Powered PDF Workspace
                </span>

            </div>



            {/* Heading */}

            <h1
                className="
                    mt-8
                    text-5xl
                    font-extrabold
                    leading-[1.05]
                    tracking-tight
                    text-fg
                    lg:text-6xl
                "
            >

                Everything you need to

                <br />

                <span
                    className="
                        bg-gradient-to-r
                        from-[var(--primary)]
                        to-purple-500
                        bg-clip-text
                        text-transparent
                    "
                >
                    Master Your PDFs
                </span>

            </h1>



            {/* Description */}

            <p
                className="
                    mt-8
                    max-w-xl
                    text-lg
                    leading-8
                    text-muted
                "
            >
                Convert, edit, summarize, secure and chat with your
                documents using powerful AI tools in one simple workspace.
            </p>



            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">


                <Link
                    href="#tools"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-2xl
                        bg-[var(--primary)]
                        px-7
                        py-4
                        font-semibold
                        text-white
                        transition-all
                        duration-300
                        hover:scale-[1.03]
                        hover:bg-[var(--primary-hover)]
                    "
                >

                    Explore Tools

                    <ArrowRight size={18} />

                </Link>



                <Link
                    href="#demo"
                    className="
                        rounded-2xl
                        border
                        border-[var(--card-border)]
                        bg-[var(--card)]
                        px-7
                        py-4
                        font-semibold
                        text-fg
                        transition-all
                        duration-300
                        hover:border-[var(--primary)]
                    "
                >
                    View Demo
                </Link>


            </div>



            {/* Trust indicators */}

            <div
                className="
                    mt-8
                    flex
                    flex-wrap
                    gap-5
                    text-sm
                    text-muted
                "
            >

                <div className="flex items-center gap-2">
                    <ShieldCheck
                        size={17}
                        className="text-[var(--primary)]"
                    />
                    Secure Processing
                </div>


                <div className="flex items-center gap-2">
                    <Zap
                        size={17}
                        className="text-[var(--primary)]"
                    />
                    Fast Conversion
                </div>


            </div>



            {/* Existing badges */}

            <div className="mt-10">
                <FeatureBadges />
            </div>


        </motion.div>
    );
}