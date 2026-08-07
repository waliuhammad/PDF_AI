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


                <button

                    key={category}

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
