"use client";

import { motion } from "framer-motion";
import {
    FileText,
    Sparkles,
    CheckCircle2,
    BrainCircuit,
    UploadCloud,
} from "lucide-react";


export function UploadPreview() {

    return (

        <motion.div
            initial={{
                opacity: 0,
                y: 25
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.6
            }}
            className="
                w-full
                rounded-[32px]
                border
                border-[var(--card-border)]
                bg-[var(--card)]
                p-8
                shadow-2xl
            "
        >


            {/* Upload Header */}

            <div
                className="
                    mb-8
                    flex
                    items-center
                    justify-between
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <UploadCloud
                        size={20}
                        className="text-[var(--primary)]"
                    />

                    <span className="
                        font-semibold
                        text-fg
                    ">
                        AI Document Processing
                    </span>

                </div>


                <span
                    className="
                        rounded-full
                        bg-[var(--primary)]/10
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-[var(--primary)]
                    "
                >
                    Live
                </span>

            </div>



            {/* File Card */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-[var(--card-border)]
                    p-4
                "
            >

                <div className="
                    flex
                    items-center
                    gap-4
                ">

                    <div
                        className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[var(--primary)]/10
                        "
                    >

                        <FileText
                            size={30}
                            className="text-[var(--primary)]"
                        />

                    </div>


                    <div>

                        <h3 className="
                            font-semibold
                            text-fg
                        ">
                            Annual_Report_2026.pdf
                        </h3>


                        <p className="
                            text-sm
                            text-muted
                        ">
                            12.8 MB • PDF Document
                        </p>

                    </div>


                </div>


                <span
                    className="
                        rounded-full
                        bg-[var(--primary)]/10
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-[var(--primary)]
                    "
                >
                    76%
                </span>


            </div>



            {/* Progress */}

            <div className="mt-7">

                <div
                    className="
                        h-3
                        overflow-hidden
                        rounded-full
                        bg-[var(--background-secondary)]
                    "
                >

                    <motion.div

                        initial={{
                            width: 0
                        }}

                        animate={{
                            width: "76%"
                        }}

                        transition={{
                            duration: 1.8
                        }}

                        className="
                            h-full
                            rounded-full
                            bg-[var(--primary)]
                        "

                    />

                </div>

            </div>




            {/* AI Steps */}

            <div className="
                mt-10
                space-y-5
            ">


                <AnalysisItem
                    icon={<BrainCircuit size={18} />}
                    title="Reading Document"
                    status="Processing..."
                />


                <AnalysisItem
                    icon={<Sparkles size={18} />}
                    title="Generating AI Summary"
                    status="Running"
                />


                <AnalysisItem
                    icon={<CheckCircle2 size={18} />}
                    title="Smart Insights"
                    status="Ready"
                    success
                />


            </div>



            {/* Bottom Info */}

            <div
                className="
                    mt-10
                    rounded-2xl
                    bg-[var(--background-secondary)]
                    p-4
                "
            >

                <p className="
                    text-sm
                    text-muted
                ">
                    AI extracted tables, charts, important points and key insights automatically.
                </p>

            </div>


        </motion.div>

    );
}



function AnalysisItem({
    icon,
    title,
    status,
    success = false,
}: {
    icon: React.ReactNode;
    title: string;
    status: string;
    success?: boolean;
}) {

    return (

        <div className="
            flex
            items-center
            justify-between
        ">

            <div className="
                flex
                items-center
                gap-3
                text-fg
            ">

                <span className="
                    text-[var(--primary)]
                ">
                    {icon}
                </span>

                <span className="font-medium">
                    {title}
                </span>

            </div>


            <span
                className={`
                    text-sm
                    font-medium
                    ${success
                        ? "text-green-500"
                        : "text-[var(--primary)]"
                    }
                `}
            >
                {status}
            </span>


        </div>

    );

}