import { useCarousel } from '../../hooks/useCarousel'
import { CAROUSEL_IMAGES, CAROUSEL_INTERVAL } from '../../utils/constants'
import FullLogo from '../../assets/logo/full-logo.png'

/**
 * Displays an image carousel with auto-rotation and manual navigation controls
 * Only visible on large screens (lg breakpoint)
 * 
 * @component
 * @returns {JSX.Element} A responsive carousel taking up 50% of the screen width
 */
export function Carousel() {
  // Use custom hook to manage carousel state and navigation
  const { currentIndex, goToSlide } = useCarousel(CAROUSEL_IMAGES, CAROUSEL_INTERVAL)
  
  // Get the current image object based on the current index
  const current = CAROUSEL_IMAGES[currentIndex]

  return (
    <div className="hidden lg:flex w-1/2 h-screen bg-dark items-center justify-center pr-0 pl-8 py-8">
      {/* Carousel Box: 90% of container size with rounded corners and shadow */}
      <div className="relative w-full h-[90%] rounded-2xl overflow-hidden shadow-2xl">
        {/* Image: Displays current carousel image with smooth opacity transition */}
        <img
          src={current.src}
          alt={current.alt}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />

        {/* Overlay: Dark semi-transparent layer with content positioned absolutely */}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-end p-8">
          {/* Navigation Dots: Interactive buttons to jump to specific slides */}
          <div className="flex gap-2">
            {/* Map over carousel images to create a button for each */}
            {CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 transition-all duration-500 ${
                  index === currentIndex ? 'w-9 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}