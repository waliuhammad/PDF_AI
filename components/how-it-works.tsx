"use client";

import { motion } from "framer-motion";
import {
    Upload,
    MousePointerClick,
    Download
} from "lucide-react";


const steps = [
    {
        icon: Upload,
        number: "01",
        title: "Choose a PDF tool",
        description:
            "Select from powerful tools to convert, edit, secure, or analyze your document.",
    },

    {
        icon: MousePointerClick,
        number: "02",
        title: "Upload your file",
        description:
            "Drag and drop your PDF or choose a file directly from your device.",
    },

    {
        icon: Download,
        number: "03",
        title: "Download result",
        description:
            "Get your processed file instantly with quality and security maintained.",
    },
];



export function HowItWorks() {

    return (

        <section
            id="how-it-works"
            className="
                px-6
                py-24
                bg-[var(--background-secondary)]
            "
        >

            <div className="max-w-7xl mx-auto">


                {/* Heading */}

                <div className="
                    text-center
                    mb-16
                ">


                    <motion.h2

                        initial={{
                            opacity: 0,
                            y: 20
                        }}

                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}

                        viewport={{
                            once: true
                        }}

                        className="
                            text-3xl
                            md:text-4xl
                            font-bold
                            text-fg
                        "
                    >

                        Complete your PDF task in minutes

                    </motion.h2>



                    <motion.p

                        initial={{
                            opacity: 0,
                            y: 20
                        }}

                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}

                        viewport={{
                            once: true
                        }}

                        transition={{
                            delay: 0.1
                        }}

                        className="
                            mt-4
                            text-muted
                            max-w-xl
                            mx-auto
                        "
                    >

                        Simple workflow designed for everyone.
                        Upload, process, and download your document.

                    </motion.p>


                </div>




                {/* Steps */}

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-8
                ">


                    {steps.map((step, index) => (


                        <motion.div

                            key={step.title}

                            initial={{
                                opacity: 0,
                                y: 25
                            }}

                            whileInView={{
                                opacity: 1,
                                y: 0
                            }}

                            viewport={{
                                once: true
                            }}

                            transition={{
                                delay: index * 0.15
                            }}

                            whileHover={{
                                y: -8
                            }}

                            className="
                                relative
                                rounded-3xl
                                border
                                border-[var(--card-border)]
                                bg-[var(--card)]
                                p-8
                                text-center
                                transition
                            "
                        >



                            {/* Number */}

                            <div className="
                                text-6xl
                                font-bold
                                text-[var(--primary)]/10
                            ">
                                {step.number}
                            </div>




                            {/* Icon */}

                            <div className="
                                mx-auto
                                -mt-8
                                mb-5
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[var(--primary)]/10
                            ">

                                <step.icon
                                    size={28}
                                    className="
                                        text-[var(--primary)]
                                    "
                                />

                            </div>




                            {/* Content */}

                            <h3 className="
                                text-lg
                                font-semibold
                                text-fg
                                mb-3
                            ">

                                {step.title}

                            </h3>



                            <p className="
                                text-sm
                                leading-relaxed
                                text-muted
                            ">

                                {step.description}

                            </p>




                            {/* Connector */}

                            {
                                index < steps.length - 1 && (

                                    <div
                                        className="
                                            hidden
                                            md:block
                                            absolute
                                            top-1/2
                                            -right-1/2
                                            w-full
                                            h-px
                                            bg-[var(--card-border)]
                                        "
                                    />

                                )
                            }


                        </motion.div>


                    ))}


                </div>


            </div>


        </section>

    );
}