"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Sparkles,
    Check,
    ShieldCheck,
    Zap,
    FileText
} from "lucide-react";


export function CTA() {

    const benefits = [
        {
            icon: Zap,
            text: "AI powered PDF processing"
        },
        {
            icon: ShieldCheck,
            text: "Secure & private files"
        },
        {
            icon: FileText,
            text: "50+ PDF tools available"
        }
    ];


    return (

        <section className="px-6 py-24">

            <motion.div

                initial={{
                    opacity: 0,
                    y: 30
                }}

                whileInView={{
                    opacity: 1,
                    y: 0
                }}

                viewport={{
                    once: true
                }}

                transition={{
                    duration: 0.6
                }}

                className="
                    relative
                    overflow-hidden
                    max-w-6xl
                    mx-auto
                    rounded-[32px]
                    border
                    border-border
                    bg-card
                    p-8
                    md:p-14
                    shadow-xl
                "
            >


                {/* Glow */}

                <div
                    className="
                        absolute
                        -right-20
                        -top-20
                        h-80
                        w-80
                        rounded-full
                        bg-primary/20
                        blur-3xl
                    "
                />



                <div
                    className="
                        relative
                        z-10
                        grid
                        lg:grid-cols-2
                        gap-12
                        items-center
                    "
                >



                    {/* Left Content */}

                    <div>


                        <div
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-primary/10
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-primary
                            "
                        >

                            <Sparkles size={16} />

                            Trusted AI PDF Workspace

                        </div>



                        <h2
                            className="
                                mt-6
                                text-4xl
                                md:text-5xl
                                font-bold
                                leading-tight
                                text-fg
                            "
                        >

                            Transform your PDFs
                            <br />

                            with powerful AI

                        </h2>



                        <p
                            className="
                                mt-5
                                max-w-xl
                                text-lg
                                leading-relaxed
                                text-muted
                            "
                        >

                            Convert, summarize, edit and analyze
                            documents instantly with intelligent AI tools
                            built for modern workflows.

                        </p>



                        {/* Rating */}

                        <div
                            className="
                                mt-6
                                flex
                                items-center
                                gap-3
                                text-sm
                                text-muted
                            "
                        >

                            <div className="flex text-yellow-400">

                                ★★★★★

                            </div>


                            <span>
                                4.9/5 from 50,000+ users
                            </span>


                        </div>




                        {/* Buttons */}

                        <div
                            className="
                                mt-8
                                flex
                                flex-wrap
                                gap-4
                            "
                        >

                            <Link
                                href="#tools"
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-primary
                                    px-7
                                    py-3.5
                                    font-semibold
                                    text-primary-foreground
                                    transition
                                    hover:scale-105
                                "
                            >

                                Start Free

                                <ArrowRight size={18} />

                            </Link>



                            <Link
                                href="/pricing"
                                className="
                                    rounded-xl
                                    border
                                    border-border
                                    px-7
                                    py-3.5
                                    font-semibold
                                    text-fg
                                    transition
                                    hover:border-primary
                                "
                            >

                                View Pricing

                            </Link>


                        </div>


                    </div>





                    {/* Right Card */}

                    <div
                        className="
                            rounded-3xl
                            bg-[var(--background-secondary)]
                            border
                            border-border
                            p-7
                        "
                    >

                        <h3
                            className="
                                text-xl
                                font-semibold
                                text-fg
                                mb-6
                            "
                        >

                            Everything you need

                        </h3>




                        <div className="space-y-5">


                            {
                                benefits.map((item) => {

                                    const Icon = item.icon;

                                    return (

                                        <div
                                            key={item.text}
                                            className="
                                                flex
                                                items-center
                                                gap-4
                                            "
                                        >

                                            <div
                                                className="
                                                    h-11
                                                    w-11
                                                    rounded-xl
                                                    bg-primary/10
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >

                                                <Icon
                                                    size={22}
                                                    className="text-primary"
                                                />

                                            </div>


                                            <span
                                                className="
                                                    text-fg
                                                    font-medium
                                                "
                                            >
                                                {item.text}
                                            </span>


                                        </div>

                                    )

                                })
                            }


                        </div>




                        <div
                            className="
                                mt-8
                                rounded-2xl
                                bg-card
                                border
                                border-border
                                p-5
                            "
                        >

                            <p className="text-sm text-muted">
                                Start using PDF AI today.
                            </p>

                            <p className="
                                mt-1
                                font-semibold
                                text-fg
                            ">
                                No credit card required 🚀
                            </p>


                        </div>


                    </div>



                </div>



            </motion.div>


        </section>

    );
}