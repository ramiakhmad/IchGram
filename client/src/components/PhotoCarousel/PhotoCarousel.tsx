import React, { useState } from "react";
import { PreviewType } from "../../utils/customHooks.ts";

type PhotoCarouselProps = {
    photos: string[];
    type?: string;
    croppedStyle?: boolean;
    previews?: PreviewType[];
};

export const PhotoCarousel = ({ photos, type, croppedStyle = false, previews }: PhotoCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
    };

    const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
    };

    // Determine the aspect ratio based on the image dimensions
    const getAspectRatio = () => {
        if (!croppedStyle || !previews || !previews[currentIndex]) return "";

        const { width, height } = previews[currentIndex];

        // Define thresholds for "much larger" comparisons
        const widthThreshold = 1.5; // Width is much larger than height
        const heightThreshold = 1.5; // Height is much larger than width

        const isWidthMuchMoreThanHeight = width / height > widthThreshold;
        const isHeightMuchMoreThanWidth = height / width > heightThreshold;

        if (isWidthMuchMoreThanHeight) {
            return "16 / 9"; // Apply 16:9 aspect ratio
        } else if (isHeightMuchMoreThanWidth) {
            return "3 / 4"; // Apply 3:4 aspect ratio
        } else {
            return ""; // No forced aspect ratio
        }
    };

    const currentImageAspectRatio = getAspectRatio();

    return (
        <div
            className={`relative flex justify-center items-center w-full max-w-[473px] ${
                type ? "h-[473px]" : "h-full"
            }`}
        >
            {/* Image */}
            {croppedStyle ? (
                <div
                    className={`${croppedStyle ? "bg-black" : ""}`}
                    style={{
                        aspectRatio: currentImageAspectRatio,
                    }}
                >
                    <img
                        src={photos[currentIndex]}
                        alt={`Photo ${currentIndex + 1}`}
                        className={`w-full h-full ${croppedStyle ? "object-cover" : "object-contain"}`}
                    />
                </div>
            ) : (
                <img
                    src={photos[currentIndex]}
                    alt={`Photo ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                />
            )}

            {/* Navigation Buttons */}
            {photos.length > 1 && (
                <>
                    <button
                        className="absolute z-10 top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full px-2.5"
                        onClick={handlePrev}
                    >
                        &#8249;
                    </button>
                    <button
                        className="absolute z-10 top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full px-2.5"
                        onClick={handleNext}
                    >
                        &#8250;
                    </button>
                </>
            )}
        </div>
    );
};