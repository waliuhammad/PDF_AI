"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Sparkles,
<<<<<<< HEAD
=======
    Check,
>>>>>>> origin/main
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

<<<<<<< HEAD
        <section className="px-6 py-20">
=======
        <section className="px-6 py-24">
>>>>>>> origin/main

            <motion.div

                initial={{
                    opacity: 0,
<<<<<<< HEAD
                    y: 25
=======
                    y: 30
>>>>>>> origin/main
                }}

                whileInView={{
                    opacity: 1,
                    y: 0
                }}

                viewport={{
                    once: true
                }}

                transition={{
<<<<<<< HEAD
                    duration: 0.55
=======
                    duration: 0.6
>>>>>>> origin/main
                }}

                className="
                    relative
                    overflow-hidden
<<<<<<< HEAD
                    max-w-5xl
                    mx-auto
                    rounded-3xl
=======
                    max-w-6xl
                    mx-auto
                    rounded-[32px]
>>>>>>> origin/main
                    border
                    border-border
                    bg-card
                    p-8
<<<<<<< HEAD
                    md:p-12
=======
                    md:p-14
>>>>>>> origin/main
                    shadow-xl
                "
            >


                {/* Glow */}

                <div
                    className="
                        absolute
                        -right-20
                        -top-20
<<<<<<< HEAD
                        h-72
                        w-72
=======
                        h-80
                        w-80
>>>>>>> origin/main
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
<<<<<<< HEAD
                        gap-10
=======
                        gap-12
>>>>>>> origin/main
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
<<<<<<< HEAD
                                px-3.5
                                py-1.5
                                text-xs
=======
                                px-4
                                py-2
                                text-sm
>>>>>>> origin/main
                                font-medium
                                text-primary
                            "
                        >

<<<<<<< HEAD
                            <Sparkles size={15} />
=======
                            <Sparkles size={16} />
>>>>>>> origin/main

                            Trusted AI PDF Workspace

                        </div>



                        <h2
                            className="
<<<<<<< HEAD
                                mt-4
                                text-3xl
                                md:text-4xl
=======
                                mt-6
                                text-4xl
                                md:text-5xl
>>>>>>> origin/main
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
<<<<<<< HEAD
                                mt-3.5
                                max-w-lg
                                text-sm
                                md:text-base
=======
                                mt-5
                                max-w-xl
                                text-lg
>>>>>>> origin/main
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
<<<<<<< HEAD
                                mt-5
                                flex
                                items-center
                                gap-3
                                text-xs
                                md:text-sm
=======
                                mt-6
                                flex
                                items-center
                                gap-3
                                text-sm
>>>>>>> origin/main
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
<<<<<<< HEAD
                                mt-7
                                flex
                                flex-wrap
                                gap-3.5
=======
                                mt-8
                                flex
                                flex-wrap
                                gap-4
>>>>>>> origin/main
                            "
                        >

                            <Link
                                href="#tools"
                                className="
                                    flex
                                    items-center
                                    gap-2
<<<<<<< HEAD
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-fg
                                    transition
                                    relative
                                    after:absolute
                                    after:bottom-1
                                    after:left-6
                                    after:right-6
                                    after:h-0.5
                                    after:bg-indigo-600
                                    after:scale-x-0
                                    after:transition-transform
                                    hover:after:scale-x-100
=======
                                    rounded-xl
                                    bg-primary
                                    px-7
                                    py-3.5
                                    font-semibold
                                    text-primary-foreground
                                    transition
                                    hover:scale-105
>>>>>>> origin/main
                                "
                            >

                                Start Free

<<<<<<< HEAD
                                <ArrowRight size={17} />
=======
                                <ArrowRight size={18} />
>>>>>>> origin/main

                            </Link>



                            <Link
                                href="/pricing"
                                className="
                                    rounded-xl
                                    border
                                    border-border
<<<<<<< HEAD
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-fg
                                    transition
                                    hover:bg-indigo-600
                                    hover:!text-white
                                    hover:border-indigo-600
=======
                                    px-7
                                    py-3.5
                                    font-semibold
                                    text-fg
                                    transition
                                    hover:border-primary
>>>>>>> origin/main
                                "
                            >

                                View Pricing

                            </Link>


                        </div>


                    </div>





                    {/* Right Card */}

                    <div
                        className="
<<<<<<< HEAD
                            rounded-2xl
                            bg-[var(--background-secondary)]
                            border
                            border-border
                            p-6
=======
                            rounded-3xl
                            bg-[var(--background-secondary)]
                            border
                            border-border
                            p-7
>>>>>>> origin/main
                        "
                    >

                        <h3
                            className="
<<<<<<< HEAD
                                text-base
                                md:text-lg
                                font-semibold
                                text-fg
                                mb-5
=======
                                text-xl
                                font-semibold
                                text-fg
                                mb-6
>>>>>>> origin/main
                            "
                        >

                            Everything you need

                        </h3>




<<<<<<< HEAD
                        <div className="space-y-4">
=======
                        <div className="space-y-5">
>>>>>>> origin/main


                            {
                                benefits.map((item) => {

                                    const Icon = item.icon;

                                    return (

                                        <div
                                            key={item.text}
                                            className="
                                                flex
                                                items-center
<<<<<<< HEAD
                                                gap-3.5
=======
                                                gap-4
>>>>>>> origin/main
                                            "
                                        >

                                            <div
                                                className="
<<<<<<< HEAD
                                                    h-10
                                                    w-10
=======
                                                    h-11
                                                    w-11
>>>>>>> origin/main
                                                    rounded-xl
                                                    bg-primary/10
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >

                                                <Icon
<<<<<<< HEAD
                                                    size={19}
=======
                                                    size={22}
>>>>>>> origin/main
                                                    className="text-primary"
                                                />

                                            </div>


                                            <span
                                                className="
<<<<<<< HEAD
                                                    text-xs
                                                    md:text-sm
=======
>>>>>>> origin/main
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


<<<<<<< HEAD
                    </div>
=======
                        </div>
>>>>>>> origin/main




<<<<<<< HEAD
                    <div
                        className="
                            mt-6
                            rounded-xl
                            bg-card
                            border
                            border-border
                            p-4
                        "
                    >

                        <p className="text-xs text-muted">
                            Start using PDF AI today.
                        </p>

                        <p className="
                            mt-0.5
                            text-xs
                            md:text-sm
                            font-semibold
                            text-fg
                        ">
                            No credit card required 🚀
                        </p>
=======
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
>>>>>>> origin/main


                    </div>


<<<<<<< HEAD
=======

>>>>>>> origin/main
                </div>



<<<<<<< HEAD
            </div>



        </motion.div>


    </section>

  );
=======
            </motion.div>


        </section>

    );
>>>>>>> origin/main
}