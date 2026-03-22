'use client';
import {useState, useEffect} from 'react';
import {ImageOff, Image as ImageIcon} from 'lucide-react';

type PosterImageProps = {
    src: string;
    alt: string;
    className?: string;
};

/**
 * PosterImage - Error-resilient image component with loading states
 *
 * A robust image component designed for displaying posters and banners
 * with graceful degradation when images fail to load.
 *
 * Features:
 * - **Loading State**: Animated skeleton loader while image loads
 * - **Error Handling**: Bilingual fallback UI when image fails
 * - **Eager Loading**: Loads immediately (no lazy loading delay)
 * - **Timeout Protection**: Shows error if loading takes >10 seconds
 * - **Accessibility**: Full ARIA support for screen readers
 * - **Dark Mode**: Supports light and dark themes
 *
 * States:
 * 1. Loading: Shows animated skeleton placeholder with icon
 * 2. Loaded: Displays the image
 * 3. Error: Shows fallback UI with icon and bilingual message
 * 4. Timeout: Treated as error after 10 seconds
 *
 * @param props - Component props
 * @param props.src - Image URL to display
 * @param props.alt - Descriptive alt text for accessibility
 * @param props.className - Optional CSS classes for styling (default: '')
 *
 * @example
 * ```tsx
 * <PosterImage
 *   src="https://example.com/poster.jpg"
 *   alt="Festival Poster: 2024 Edition"
 *   className="w-full h-auto rounded-lg"
 * />
 * ```
 */
export const PosterImage = ({src, alt, className = ''}: PosterImageProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Timeout protection: Show error if image takes too long to load
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setHasError(true);
                setIsLoading(false);
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timeout);
    }, [isLoading]);

    if (hasError) {
        return (
            <div
                className={`flex flex-col items-center justify-center bg-primary-100 dark:bg-primary-800 rounded-lg p-8 ${className}`}
                role="img"
                aria-label={alt}
            >
                <ImageOff
                    className="text-primary-400 dark:text-primary-600 mb-4"
                    size={48}
                    aria-hidden="true"
                />
                <p className="text-sm text-primary-600 dark:text-primary-400 text-center">
                    صورة غير متوفرة
                </p>
                <p className="text-xs text-primary-500 dark:text-primary-500 text-center mt-1">
                    Image unavailable
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {isLoading && (
                <div
                    className={`flex flex-col items-center justify-center bg-primary-100 dark:bg-primary-800 rounded-lg p-8 min-h-[256px] ${className}`}
                    role="status"
                    aria-label="Loading image"
                >
                    <div className="animate-pulse flex flex-col items-center">
                        <ImageIcon
                            className="text-primary-300 dark:text-primary-600 mb-3"
                            size={56}
                            aria-hidden="true"
                        />
                        <div className="h-2 w-32 bg-primary-300 dark:bg-primary-600 rounded mb-2" />
                        <div className="h-2 w-24 bg-primary-300 dark:bg-primary-600 rounded" />
                    </div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`${className} ${isLoading ? 'hidden' : 'block'} transition-opacity duration-300`}
                onLoad={() => setIsLoading(false)}
                onError={(e) => {
                    setIsLoading(false);
                    setHasError(true);
                    // Log error in development for debugging
                    if (process.env.NODE_ENV === 'development') {
                        console.error(`Failed to load image: ${src}`, e);
                    }
                }}
                loading="eager"
            />
        </div>
    );
};
