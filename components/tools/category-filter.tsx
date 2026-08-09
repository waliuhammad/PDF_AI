"use client";



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

        // On a phone six pills wrapped to three rows. They scroll in one row
        // instead, bleeding to the screen edges via the negative margin so the
        // row reads as scrollable rather than clipped. From sm up it is the
        // original centred wrap. The bottom margin lived here *and* on the
        // wrapper in tools-grid, which is where the doubled gap came from.
        <div
            className="
                flex
                flex-nowrap
                overflow-x-auto
                no-scrollbar
                -mx-4
                px-4
                gap-2
                sm:mx-0
                sm:px-0
                sm:flex-wrap
                sm:justify-center
                sm:gap-3
                sm:overflow-visible
            "
        >

            {categories.map((category) => (


                <button

                    key={category}

                    onClick={() =>
                        setActiveCategory(category)
                    }

                    className={`
                        relative
                        shrink-0
                        overflow-hidden
                        rounded-full
                        px-3.5
                        sm:px-5
                        py-2
                        sm:py-2.5
                        text-xs
                        sm:text-sm
                        font-medium
                        whitespace-nowrap
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        active:scale-95
                        border

                        ${activeCategory === category

                            ? `
                                bg-indigo-600
                                text-white
                                border-indigo-600
                                shadow-lg
                            `

                            : `
                                bg-[var(--card)]
                                text-muted
                                border-[var(--card-border)]
                                hover:border-indigo-600
                                hover:text-indigo-600
                            `
                        }
                    `}
                >

                    {category}


                    {/* Was a layoutId span that slid between pills. Toggling opacity keeps
                        the highlight without framer's shared layout engine. */}
                    <span
                        className={`absolute inset-0 -z-10 bg-indigo-600 transition-opacity duration-200 ${activeCategory === category ? "opacity-100" : "opacity-0"}`}
                    />


                </button>


            ))}


        </div>

    );
}
