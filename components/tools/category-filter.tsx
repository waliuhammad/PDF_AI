"use client";

import { motion } from "framer-motion";


interface CategoryFilterProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}


const categories = [
    "All Tools",
    "Convert",
    "Edit",
    "AI Tools",
    "Security",
    "Organize",
];



export default function CategoryFilter({
    activeCategory,
    setActiveCategory,
}: CategoryFilterProps) {


    return (

        <div
            className="
                flex
                flex-wrap
                justify-center
                gap-3
                mb-10
            "
        >

            {categories.map((category) => (


                <motion.button

                    key={category}

                    whileTap={{
                        scale: 0.95
                    }}

                    whileHover={{
                        y: -2
                    }}

                    onClick={() =>
                        setActiveCategory(category)
                    }

                    className={`
                        relative
                        overflow-hidden
                        rounded-full
                        px-5
                        py-2.5
                        text-sm
                        font-medium
                        transition-all
                        duration-300
                        border

                        ${activeCategory === category

                            ? `
                                bg-[var(--primary)]
                                text-white
                                border-[var(--primary)]
                                shadow-lg
                            `

                            :

                            `
                                bg-[var(--card)]
                                text-muted
                                border-[var(--card-border)]
                                hover:border-[var(--primary)]
                                hover:text-[var(--primary)]
                            `
                        }
                    `}
                >

                    {category}


                    {
                        activeCategory === category && (

                            <motion.span

                                layoutId="category-active"

                                className="
                                    absolute
                                    inset-0
                                    -z-10
                                    bg-[var(--primary)]
                                "

                            />

                        )
                    }


                </motion.button>


            ))}


        </div>

    );
}