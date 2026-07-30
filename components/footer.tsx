"use client";

import { FileText } from "lucide-react";
import {
    FaLinkedin,
    FaGithub,
    FaTwitter,
} from "react-icons/fa";


const productLinks = [
    "Merge PDF",
    "Compress PDF",
    "PDF Converter",
    "OCR Scanner",
    "AI PDF Chat",
];


const companyLinks = [
    "About",
    "Contact",
    "Pricing",
    "Blog",
];


const legalLinks = [
    "Privacy Policy",
    "Terms of Service",
    "Security",
];


export default function Footer() {

    return (
        <footer
            className="
                border-t
                border-border
                bg-[var(--background-secondary)]
                px-6
                py-16
            "
        >

            <div
                className="
                    max-w-6xl
                    mx-auto
                    grid
                    md:grid-cols-4
                    gap-10
                "
            >

                {/* Brand */}

                <div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mb-4
                        "
                    >

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-primary
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <FileText className="text-primary-foreground" />
                        </div>


                        <h2 className="
                            text-xl
                            font-bold
                            text-fg
                        ">
                            PDF AI
                        </h2>

                    </div>


                    <p className="
                        text-muted
                        text-sm
                        leading-relaxed
                    ">
                        All-in-one PDF tools powered by modern technology and AI.
                    </p>


                    <div className="
                        flex
                        gap-4
                        mt-5
                    ">

                        <FaTwitter
                            className="
                                w-5
                                h-5
                                text-muted
                                hover:text-primary
                                cursor-pointer
                            "
                        />

                        <FaLinkedin
                            className="
                                w-5
                                h-5
                                text-muted
                                hover:text-primary
                                cursor-pointer
                            "
                        />

                        <FaGithub
                            className="
                                w-5
                                h-5
                                text-muted
                                hover:text-primary
                                cursor-pointer
                            "
                        />

                    </div>

                </div>



                {/* Product */}

                <div>

                    <h3 className="
                        font-semibold
                        text-fg
                        mb-4
                    ">
                        Product
                    </h3>


                    <ul className="space-y-3">

                        {productLinks.map((item) => (
                            <li
                                key={item}
                                className="
                                    text-sm
                                    text-muted
                                    hover:text-primary
                                    cursor-pointer
                                "
                            >
                                {item}
                            </li>
                        ))}

                    </ul>

                </div>




                {/* Company */}

                <div>

                    <h3 className="
                        font-semibold
                        text-fg
                        mb-4
                    ">
                        Company
                    </h3>


                    <ul className="space-y-3">

                        {companyLinks.map((item) => (
                            <li
                                key={item}
                                className="
                                    text-sm
                                    text-muted
                                    hover:text-primary
                                    cursor-pointer
                                "
                            >
                                {item}
                            </li>
                        ))}

                    </ul>

                </div>




                {/* Legal */}

                <div>

                    <h3 className="
                        font-semibold
                        text-fg
                        mb-4
                    ">
                        Legal
                    </h3>


                    <ul className="space-y-3">

                        {legalLinks.map((item) => (
                            <li
                                key={item}
                                className="
                                    text-sm
                                    text-muted
                                    hover:text-primary
                                    cursor-pointer
                                "
                            >
                                {item}
                            </li>
                        ))}

                    </ul>

                </div>


            </div>



            <div
                className="
                    max-w-6xl
                    mx-auto
                    mt-12
                    pt-6
                    border-t
                    border-border
                    text-center
                    text-sm
                    text-muted
                "
            >
                © {new Date().getFullYear()} PDF AI. All rights reserved.
            </div>


        </footer>
    );
}