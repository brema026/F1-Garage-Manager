import { useState, useEffect } from 'react';

/**
 * This hook automatically cycles through a list of images at a given interval
 * and provides functions to manually navigate between slides.
 * When a slide is manually selected, the auto-advance timer resets.
 *
 * @function useCarousel
 * @param {Array<{src: string, alt: string}>} images - Array of image objects with `src` and `alt` properties.
 * @param {number} interval - Time in milliseconds between automatic slide transitions.
 * @returns {Object} Carousel state and navigation functions.
 * @returns {number} return.currentIndex - Index of the currently active slide.
 * @returns {function} return.goToSlide - Function to navigate directly to a specific slide by index.
 * @returns {function} return.nextSlide - Function to navigate to the next slide.
 * @returns {function} return.prevSlide - Function to navigate to the previous slide.
 */
export function useCarousel(images, interval) {
  // State to track the current index of the carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  // State to reset the timer when manually navigating
  const [resetTimer, setResetTimer] = useState(0);

  // Auto-advance the carousel at specified intervals
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval, resetTimer]);
  
  // Go to a specific slide and reset the auto-advance timer
  const goToSlide = (index) => {
    setCurrentIndex(index);
    setResetTimer((prev) => prev + 1);
  };

  // Go to the next slide
  const nextSlide = () =>
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

  // Go to the previous slide
  const prevSlide = () =>
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

  // Return the current index and navigation functions
  return {
    currentIndex,
    goToSlide,
    nextSlide,
    prevSlide,
  };
}