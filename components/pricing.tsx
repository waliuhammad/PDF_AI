"use client";

<<<<<<< HEAD
import { Check, Star, Users, Crown } from "lucide-react";
=======
import { Check, Star, Users } from "lucide-react";
>>>>>>> origin/main
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

<<<<<<< HEAD
        <section className="px-6 py-22">
=======
        <section className="px-6 py-24">
>>>>>>> origin/main

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
<<<<<<< HEAD
                            px-4.5
                            py-2
                            text-xs
                            md:text-sm
                            text-primary
                            mb-5
                        "
                    >

                        <Star size={15} fill="currentColor" />
=======
                            px-5
                            py-2
                            text-sm
                            text-primary
                            mb-6
                        "
                    >

                        <Star size={16} fill="currentColor" />
>>>>>>> origin/main

                        Rated 4.9/5 by 50,000+ users

                    </div>


                    <h2
                        className="
<<<<<<< HEAD
                            text-3xl
                            md:text-4xl
=======
                            text-4xl
>>>>>>> origin/main
                            font-bold
                            text-fg
                        "
                    >
                        Simple pricing that scales with you
                    </h2>


<<<<<<< HEAD
                    <p className="mt-3 text-sm md:text-base text-muted">
=======
                    <p className="mt-4 text-muted">
>>>>>>> origin/main
                        Choose the plan that fits your PDF workflow.
                    </p>



<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main


                </div>




                {/* Pricing Cards */}

                <div className="
                    grid
                    md:grid-cols-3
<<<<<<< HEAD
                    gap-7
                    max-w-5xl
                    mx-auto
=======
                    gap-8
>>>>>>> origin/main
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
<<<<<<< HEAD
                                y: -6
=======
                                y: -10
>>>>>>> origin/main
                            }}

                            className={`
                                relative
                                rounded-3xl
                                border
<<<<<<< HEAD
                                p-7
=======
                                p-8
>>>>>>> origin/main
                                bg-card

                                ${plan.popular
                                    ?
<<<<<<< HEAD
                                    "border-primary shadow-xl md:-translate-y-2 ring-2 ring-primary/20"
=======
                                    "border-primary shadow-2xl scale-105"
>>>>>>> origin/main
                                    :
                                    "border-border"
                                }
                            `}
                        >


                            {plan.popular && (

                                <div
                                    className="
                                        absolute
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
                                </div>

                            )}



<<<<<<< HEAD
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
=======
                            <h3 className="
                                text-xl
                                font-bold
                                text-fg
                            ">
                                {plan.name}
                            </h3>
>>>>>>> origin/main



                            <div className="
<<<<<<< HEAD
                                mt-3.5
                                text-3xl
                                md:text-4xl
=======
                                mt-5
                                text-4xl
>>>>>>> origin/main
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
<<<<<<< HEAD
                                    text-xs
                                    md:text-sm
=======
                                    text-sm
>>>>>>> origin/main
                                    font-normal
                                    text-muted
                                ">
                                    /month
                                </span>

                            </div>



                            <p className="
<<<<<<< HEAD
                                mt-3.5
                                text-xs
                                md:text-sm
=======
                                mt-4
>>>>>>> origin/main
                                text-muted
                            ">
                                {plan.description}
                            </p>



                            <ul className="
<<<<<<< HEAD
                                mt-6
                                space-y-3.5
=======
                                mt-8
                                space-y-4
>>>>>>> origin/main
                            ">

                                {plan.features.map(feature => (

                                    <li
                                        key={feature}
                                        className="
                                            flex
                                            gap-3
<<<<<<< HEAD
                                            text-xs
                                            md:text-sm
=======
                                            text-sm
>>>>>>> origin/main
                                            text-muted
                                        "
                                    >

                                        <Check
<<<<<<< HEAD
                                            size={17}
                                            className="text-primary shrink-0"
=======
                                            size={18}
                                            className="text-primary"
>>>>>>> origin/main
                                        />

                                        {feature}

                                    </li>

                                ))}

                            </ul>



                            <button
                                className={`
<<<<<<< HEAD
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
=======
                                    mt-8
                                    w-full
                                    py-3
                                    rounded-xl
                                    font-medium

                                    ${plan.popular
                                        ?
                                        "bg-primary text-white"
>>>>>>> origin/main
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
<<<<<<< HEAD
                        mt-14
=======
                        mt-16
>>>>>>> origin/main
                        flex
                        flex-col
                        md:flex-row
                        justify-center
<<<<<<< HEAD
                        gap-7
                        items-center
                        text-xs
                        md:text-sm
=======
                        gap-8
                        items-center
>>>>>>> origin/main
                        text-muted
                    "
                >

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

<<<<<<< HEAD
                        <Users size={18} />
=======
                        <Users size={20} />
>>>>>>> origin/main

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
<<<<<<< HEAD
                                size={17}
=======
                                size={22}
>>>>>>> origin/main
                                fill="currentColor"
                            />

                        ))}


<<<<<<< HEAD
                        <span className="text-muted ml-1.5">
=======
                        <span className="text-muted ml-2">
>>>>>>> origin/main
                            4.9/5 average rating
                        </span>

                    </div>


                </div>


            </div>

        </section>

    );
}