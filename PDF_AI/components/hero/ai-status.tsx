"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";


export function AIStatus() {

    return (

        <motion.div

            initial={{
                opacity: 0,
                x: 30,
                y: -20
            }}

            animate={{
                opacity: 1,
                x: 0,
                y: 0
            }}

            transition={{
                delay: 0.8,
                duration: 0.6
            }}

            className="
                w-64
                rounded-2xl
                border
                border-[var(--card-border)]
                bg-[var(--card)]/90
                backdrop-blur-xl
                p-5
                shadow-xl
            "

        >


            {/* Header */}

            <div className="
                flex
                items-center
                gap-3
            ">


                <div
                    className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-[var(--primary)]/10
                    "
                >

                    <BrainCircuit
                        size={22}
                        className="text-[var(--primary)]"
                    />

                </div>



                <div>

                    <h4 className="
                        font-semibold
                        text-fg
                    ">
                        AI Assistant
                    </h4>


                    <p className="
                        text-xs
                        text-muted
                    ">
                        Analysing document...
                    </p>

                </div>


            </div>




            {/* Status */}

            <div className="
                mt-5
                space-y-3
            ">


                <div className="
                    flex
                    items-center
                    justify-between
                ">

                    <span className="
                        text-sm
                        text-fg
                    ">
                        OCR Detection
                    </span>


                    <span className="
                        text-sm
                        font-semibold
                        text-green-500
                    ">
                        Complete
                    </span>


                </div>




                <div className="
                    flex
                    items-center
                    justify-between
                ">


                    <span className="
                        text-sm
                        text-fg
                    ">
                        AI Summary
                    </span>



                    <span className="
                        flex
                        items-center
                        gap-1
                        text-sm
                        font-medium
                        text-[var(--primary)]
                    ">

                        <Sparkles size={14} />

                        Running

                    </span>


                </div>


            </div>


        </motion.div>

    );
}