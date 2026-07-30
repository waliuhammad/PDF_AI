"use client";

import { Check, Star, Users, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";


const plans = [
    {
        name: "Free",
        monthly: "£0",
        yearly: "£0",
        description: "Perfect for trying basic PDF tools.",
        features: [
            "Basic PDF conversions",
            "Merge & split PDFs",
            "Limited daily usage",
            "Standard processing speed",
        ],
    },

    {
        name: "Pro",
        monthly: "£9.99",
        yearly: "£7.99",
        description: "Advanced tools for professionals.",
        popular: true,
        features: [
            "Unlimited PDF tools",
            "AI PDF Summary",
            "OCR processing",
            "Fast conversions",
            "No advertisements",
        ],
    },

    {
        name: "Business",
        monthly: "£29.99",
        yearly: "£23.99",
        description: "Powerful PDF workflow for teams.",
        features: [
            "Everything in Pro",
            "Team collaboration",
            "Priority processing",
            "Advanced security",
            "Dedicated support",
        ],
    },
];


export default function Pricing() {

    const [billing, setBilling] =
        useState<"monthly" | "yearly">("monthly");


    return (

        <section className="px-6 py-22">

            <div className="max-w-6xl mx-auto">


                {/* Heading */}

                <div className="text-center mb-10">

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-primary/10
                            px-4.5
                            py-2
                            text-xs
                            md:text-sm
                            text-primary
                            mb-5
                        "
                    >

                        <Star size={15} fill="currentColor" />

                        Rated 4.9/5 by 50,000+ users

                    </div>


                    <h2
                        className="
                            text-3xl
                            md:text-4xl
                            font-bold
                            text-fg
                        "
                    >
                        Simple pricing that scales with you
                    </h2>


                    <p className="mt-3 text-sm md:text-base text-muted">
                        Choose the plan that fits your PDF workflow.
                    </p>



                    {/* Billing Toggle */}

                    <div className="flex justify-center mt-7">

                        <div
                            className="
                                inline-flex
                                rounded-full
                                border
                                border-border
                                bg-card
                                p-1.5
                            "
                        >

                            <button
                                onClick={() => setBilling("monthly")}
                                className={`
                                    px-5.5
                                    py-2.5
                                    rounded-full
                                    text-xs
                                    md:text-sm
                                    font-medium
                                    transition-all
                                    duration-300

                                    ${
                                        billing === "monthly"
                                            ? "bg-indigo-600 text-white"
                                            : "text-black hover:text-indigo-600"
                                    }
                                `}
                            >
                                Monthly
                            </button>

                            <button
                                onClick={() => setBilling("yearly")}
                                className={`
                                    px-5.5
                                    py-2.5
                                    rounded-full
                                    text-xs
                                    md:text-sm
                                    font-medium
                                    transition-all
                                    duration-300

                                    ${
                                        billing === "yearly"
                                            ? "bg-indigo-600 text-white"
                                            : "text-black hover:text-indigo-600"
                                    }
                                `}
                            >

                                Yearly

                                <span
                                    className={`
                                        ml-2
                                        text-xs
                                        ${
                                            billing === "yearly"
                                                ? "text-white"
                                                : "text-green-500"
                                        }
                                    `}
                                >
                                    Save 20%
                                </span>

                            </button>

                        </div>

                    </div>


                </div>




                {/* Pricing Cards */}

                <div className="
                    grid
                    md:grid-cols-3
                    gap-7
                    max-w-5xl
                    mx-auto
                ">


                    {plans.map((plan, index) => (

                        <motion.div

                            key={plan.name}

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
                                delay: index * 0.1
                            }}

                            whileHover={{
                                y: -6
                            }}

                            className={`
                                relative
                                rounded-3xl
                                border
                                p-7
                                bg-card

                                ${plan.popular
                                    ?
                                    "border-primary shadow-xl md:-translate-y-2 ring-2 ring-primary/20"
                                    :
                                    "border-border"
                                }
                            `}
                        >


                            {plan.popular && (

                                <div
                                    className="
                                        absolute
                                        -top-3.5
                                        left-1/2
                                        -translate-x-1/2
                                        bg-gradient-to-r from-indigo-600 to-violet-600
                                        text-white
                                        px-4
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-semibold
                                        shadow-md
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >

                                    <b>Most Popular</b>
                                </div>

                            )}



                            <div className="flex items-center justify-between">
                                <h3 className="
                                    text-lg
                                    md:text-xl
                                    font-bold
                                    text-fg
                                    flex
                                    items-center
                                    gap-2
                                ">
                                    {plan.name}
                                    {plan.popular && (
                                        <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-500 p-1 rounded-full">
                                            <Crown size={15} className="fill-amber-500" />
                                        </span>
                                    )}
                                </h3>
                            </div>



                            <div className="
                                mt-3.5
                                text-3xl
                                md:text-4xl
                                font-bold
                                text-fg
                            ">

                                {
                                    billing === "monthly"
                                        ?
                                        plan.monthly
                                        :
                                        plan.yearly
                                }


                                <span className="
                                    text-xs
                                    md:text-sm
                                    font-normal
                                    text-muted
                                ">
                                    /month
                                </span>

                            </div>



                            <p className="
                                mt-3.5
                                text-xs
                                md:text-sm
                                text-muted
                            ">
                                {plan.description}
                            </p>



                            <ul className="
                                mt-6
                                space-y-3.5
                            ">

                                {plan.features.map(feature => (

                                    <li
                                        key={feature}
                                        className="
                                            flex
                                            gap-3
                                            text-xs
                                            md:text-sm
                                            text-muted
                                        "
                                    >

                                        <Check
                                            size={17}
                                            className="text-primary shrink-0"
                                        />

                                        {feature}

                                    </li>

                                ))}

                            </ul>



                            <button
                                className={`
                                    mt-7
                                    w-full
                                    py-3
                                    rounded-xl
                                    text-xs
                                    md:text-sm
                                    font-medium
                                    transition-all

                                    ${plan.popular
                                        ?
                                        "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-95"
                                        :
                                        "border border-border hover:border-primary"
                                    }
                                `}
                            >

                                {
                                    plan.name === "Free"
                                        ?
                                        "Start Free"
                                        :
                                        "Upgrade Now"
                                }

                            </button>


                        </motion.div>

                    ))}


                </div>




                {/* Reviews */}

                <div
                    className="
                        mt-14
                        flex
                        flex-col
                        md:flex-row
                        justify-center
                        gap-7
                        items-center
                        text-xs
                        md:text-sm
                        text-muted
                    "
                >

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

                        <Users size={18} />

                        Trusted by 50,000+ creators

                    </div>



                    <div className="
                        flex
                        items-center
                        gap-2
                        text-yellow-400
                    ">

                        {[1, 2, 3, 4, 5].map(star => (

                            <Star
                                key={star}
                                size={17}
                                fill="currentColor"
                            />

                        ))}


                        <span className="text-muted ml-1.5">
                            4.9/5 average rating
                        </span>

                    </div>


                </div>


            </div>

        </section>

    );
}
