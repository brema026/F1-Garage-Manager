import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import FullLogo from '../../assets/logo/full-logo-white.png';

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    return (
        <div className="w-full lg:w-1/2 h-screen bg-dark flex items-center justify-center p-8">
            {/* Form Box */}
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="mb-8 text-center">
                <img 
                    src={FullLogo} 
                    alt="F1 Garage Logo"
                    className="w-40 h-auto mx-auto"
                />
                </div>

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold text-light">Bienvenido</h1>
                        <p className="text-sm text-light">
                            ¿Ya posee una cuenta?{' '}
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="text-primary-hover-underline font-semibold hover:underline">
                                Iniciar sesión
                            </button>
                        </p>
                    </div>
                    <p className="text-light">
                        Por favor, complete la siguiente información para crear su cuenta.
                    </p>
                </div>

                {/* Register Form */}
                <form className="space-y-4">
                    {/* First Name and Last Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Nombre"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        
                        <input 
                            type="text" 
                            placeholder="Apellido"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <input 
                            type="email" 
                            placeholder="Correo electrónico"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    
                    {/* User Role Selector */}
                    <div>
                        <select
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue=""
                        >
                            <option value="" disabled>Seleccione un rol</option>
                            <option value="conductor">Conductor</option>
                            <option value="ingeniero">Ingeniero</option>
                            <option value="administrador">Administrador</option>
                        </select>
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

                    {/* Confirm Password Input */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <AiOutlineEyeInvisible className="text-xl" />
                            ) : (
                                <AiOutlineEye className="text-xl" />
                            )}
                        </button>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-1 mr-2 text-primary focus:ring-primary accent-primary"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            Acepto los <a href="#" className="text-primary hover:underline">Términos de Servicio</a> y la <a href="#" className="text-primary hover:underline">Política de Privacidad</a>.
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-6"
                    >
                        Crear cuenta
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-light"></div>
                        <span className="px-3 text-light text-sm">O continuar con</span>
                        <div className="flex-1 border-t border-light"></div>
                    </div>

                    {/* Social Register Buttons */}
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
                </form>
            </div>
        </div>
    )
}
