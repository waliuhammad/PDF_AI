"use client";

import { Check, Star, Users } from "lucide-react";
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

        <section className="px-6 py-24">

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
                            px-5
                            py-2
                            text-sm
                            text-primary
                            mb-6
                        "
                    >

                        <Star size={16} fill="currentColor" />

                        Rated 4.9/5 by 50,000+ users

                    </div>


                    <h2
                        className="
                            text-4xl
                            font-bold
                            text-fg
                        "
                    >
                        Simple pricing that scales with you
                    </h2>


                    <p className="mt-4 text-muted">
                        Choose the plan that fits your PDF workflow.
                    </p>



                    {/* Billing Toggle */}

                    <div className="flex justify-center mt-8">

                        <div
                            className="
                                inline-flex
                                rounded-full
                                border
                                border-border
                                bg-card
                                p-1
                            "
                        >

                            <button
                                onClick={() => setBilling("monthly")}
                                className={`
                                    px-6
                                    py-2.5
                                    rounded-full
                                    text-sm
                                    font-medium
                                    transition

                                    ${billing === "monthly"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted"
                                    }
                                `}
                            >
                                Monthly
                            </button>



                            <button
                                onClick={() => setBilling("yearly")}
                                className={`
                                    px-6
                                    py-2.5
                                    rounded-full
                                    text-sm
                                    font-medium
                                    transition

                                    ${billing === "yearly"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted"
                                    }
                                `}
                            >

                                Yearly

                                <span className="
                                    ml-2
                                    text-xs
                                    text-green-500
                                ">
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
                    gap-8
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
                                y: -10
                            }}

                            className={`
                                relative
                                rounded-3xl
                                border
                                p-8
                                bg-card

                                ${plan.popular
                                    ?
                                    "border-primary shadow-2xl scale-105"
                                    :
                                    "border-border"
                                }
                            `}
                        >


                            {plan.popular && (

                                <div
                                    className="
                                        absolute
                                        -top-4
                                        left-1/2
                                        -translate-x-1/2
                                        bg-primary
                                        text-white
                                        px-5
                                        py-1
                                        rounded-full
                                        text-sm
                                    "
                                >
                                    Most Popular
                                </div>

                            )}



                            <h3 className="
                                text-xl
                                font-bold
                                text-fg
                            ">
                                {plan.name}
                            </h3>



                            <div className="
                                mt-5
                                text-4xl
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
                                    text-sm
                                    font-normal
                                    text-muted
                                ">
                                    /month
                                </span>

                            </div>



                            <p className="
                                mt-4
                                text-muted
                            ">
                                {plan.description}
                            </p>



                            <ul className="
                                mt-8
                                space-y-4
                            ">

                                {plan.features.map(feature => (

                                    <li
                                        key={feature}
                                        className="
                                            flex
                                            gap-3
                                            text-sm
                                            text-muted
                                        "
                                    >

                                        <Check
                                            size={18}
                                            className="text-primary"
                                        />

                                        {feature}

                                    </li>

                                ))}

                            </ul>



                            <button
                                className={`
                                    mt-8
                                    w-full
                                    py-3
                                    rounded-xl
                                    font-medium

                                    ${plan.popular
                                        ?
                                        "bg-primary text-white"
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
                        mt-16
                        flex
                        flex-col
                        md:flex-row
                        justify-center
                        gap-8
                        items-center
                        text-muted
                    "
                >

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

                        <Users size={20} />

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
                                size={22}
                                fill="currentColor"
                            />

                        ))}


                        <span className="text-muted ml-2">
                            4.9/5 average rating
                        </span>

                    </div>


                </div>


            </div>

        </section>

    );
}