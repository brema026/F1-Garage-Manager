import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import FullLogo from '../../assets/logo/full-logo-white.png';
import api from '../../api/axios';
import { useNavigate } from "react-router-dom";

export function RegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form data state for registration
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        rol: '',
        password: '',
        confirmPassword: '',
        id_equipo: '0' // Default team ID for no team
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const dataToSumit = {
                nombre: `${formData.nombre} ${formData.apellido}`,
                email: formData.email,
                password: formData.password,
                rol: formData.rol,
                id_equipo: formData.id_equipo
            };

            const response = await api.post('/auth/register', dataToSumit);
            alert("Registro exitoso. Ahora puede iniciar sesión.");
            navigate('/login');
        }

        catch (e) {
            console.error("Error during registration:", e);
            alert("Error durante el registro. Por favor, intente nuevamente.");
        }
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
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* First Name and Last Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Nombre"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        
                        <input 
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Apellido"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange} 
                            type="email" 
                            placeholder="Correo electrónico"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>
                    
                    {/* User Role Selector */}
                    <div>
                        <select
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue=""
                            required
                        >
                            <option value="" disabled>Seleccione un rol</option>
                            <option value="Driver">Conductor</option>
                            <option value="Engineer">Ingeniero</option>
                            <option value="Admin">Administrador</option>
                        </select>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <input
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                            required
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
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                            required
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover transition-colors mt-6"
                    >
                        Crear cuenta
                    </button>
                </form>
            </div>
        </div>
    )
}
