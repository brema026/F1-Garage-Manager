import { Carousel } from "../components/common/Carousel";
import { RegisterForm } from "../components/auth/RegisterForm";

/**
 * Main register page layout with carousel on the right and register form on the left.
 * Responsive design: carousel hidden on mobile, full width form on small screens.
 * Inverse layout compared to Login page - carousel is on the right instead of left.
 * 
 * @component
 * @returns {JSX.Element} Register page with two-column layout (inverted)
 */
export function Register() {
  return (
    <div className="flex min-h-screen bg-dark">
      {/* Carousel component: 50% width on large screens, hidden on mobile (right side) */}
      <Carousel />
      
      {/* Register form container: Full width on mobile, 50% on large screens (left side) */}
      <RegisterForm />
    </div>
  );
}