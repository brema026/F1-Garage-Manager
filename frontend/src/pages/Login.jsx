import { Carousel } from "../components/common/Carousel";
import { LoginForm } from "../components/auth/LoginForm";

/**
 * Main login page layout with carousel on the left and login form placeholder on the right.
 * Responsive design: carousel hidden on mobile, full width form on small screens.
 * 
 * @component
 * @returns {JSX.Element} Login page with two-column layout
 */
export function Login({ setIsLoggedIn, setUser }) {
  return (
    <div className="flex min-h-screen bg-dark">
      {/* Carousel component: 50% width on large screens, hidden on mobile */}
      <Carousel />
      
      {/* Login form container: Full width on mobile, 50% on large screens */}
      <LoginForm setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
    </div>
  );
}