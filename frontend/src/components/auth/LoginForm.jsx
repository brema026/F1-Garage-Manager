import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { FaGoogle, FaApple, FaFacebook } from 'react-icons/fa'

/**
 * Login Form Component
 * Displays login form with email and password fields
 * 
 * @component
 * @returns {JSX.Element} Login form container
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="w-full lg:w-1/2 h-screen bg-dark flex items-center justify-center p-8">
      {/* Form Box */}
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-light">¡Hola de nuevo!</h1>
            <p className="text-sm text-light">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => window.location.href = '/register'}
                className="text-primary-hover-underline font-semibold hover:underline">
                Regístrate
              </button>
            </p>
          </div>
          <p className="text-light">Ingrese su información de inicio de sesión</p>
        </div>

        {/* Login Form */}
        <form className="space-y-4">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-xl" />
              ) : (
                <AiOutlineEye className="text-xl" />
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a href="#" className="text-sm text-light font-semibold hover:underline">
              ¿Olvidó su contraseña?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-6"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-light"></div>
          <span className="px-3 text-light text-sm">O continúa con</span>
          <div className="flex-1 border-t border-light"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-4 justify-center">
          <button className="flex items-center justify-center w-14 h-14 border border-gray-300 rounded-lg bg-white hover:bg-gray-300 transition-colors">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-7 h-7" />
          </button>
          <button className="flex items-center justify-center w-14 h-14 border border-gray-300 rounded-lg bg-white hover:bg-gray-300 transition-colors">
            <FaApple className="text-3xl text-black" />
          </button>
          <button className="flex items-center justify-center w-14 h-14 border border-gray-300 rounded-lg bg-white hover:bg-gray-300 transition-colors">
            <FaFacebook className="text-3xl" style={{ color: '#1877F2' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
