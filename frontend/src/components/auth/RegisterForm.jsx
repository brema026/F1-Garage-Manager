import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiCheckCircle } from "react-icons/fi";
import FullLogo from '../../assets/logo/full-logo-white.png';
import api from '../../api/axios';
import { useNavigate } from "react-router-dom";
import { InputWithValidation, SelectWithValidation } from '../common/Validation';
import { 
  validatePassword, 
  validateEmail, 
  validateName, 
  validateRole,
  validatePasswordMatch,
  parseBackendError 
} from '../../utils/validations';

export function RegisterForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        rol: '',
        password: '',
        confirmPassword: '',
        id_equipo: '0'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Evitar espacios en nombre y apellido
        const cleanedValue = 
            name === "nombre" || name === "apellido"
                ? value.replace(/\s+/g, "") 
                : value;

        setFormData(prev => ({ ...prev, [name]: cleanedValue }));

        // Limpiar error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const clearError = (fieldName) => {
        setErrors(prev => ({ ...prev, [fieldName]: null }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar nombre
        const nombreValidation = validateName(formData.nombre, 'Nombre');
        if (!nombreValidation.isValid) {
            newErrors.nombre = nombreValidation.errors[0];
        }

        // Validar apellido
        const apellidoValidation = validateName(formData.apellido, 'Apellido');
        if (!apellidoValidation.isValid) {
            newErrors.apellido = apellidoValidation.errors[0];
        }

        // Validar email
        if (!formData.email || formData.email.trim() === '') {
            newErrors.email = 'El correo electrónico es obligatorio';
        } else {
            const emailValidation = validateEmail(formData.email);
            if (!emailValidation.isValid) {
                newErrors.email = emailValidation.errors[0];
            }
        }

        // Validar rol
        const rolValidation = validateRole(formData.rol);
        if (!rolValidation.isValid) {
            newErrors.rol = rolValidation.errors[0];
        }

        // Validar contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else {
            const passwordValidation = validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.errors[0];
            }
        }

        // Validar confirmación
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else {
            const matchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
            if (!matchValidation.isValid) {
                newErrors.confirmPassword = matchValidation.errors[0];
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const dataToSubmit = {
                nombre: `${formData.nombre} ${formData.apellido}`,
                email: formData.email,
                password: formData.password,
                rol: formData.rol,
                id_equipo: formData.id_equipo
            };

            await api.post('/auth/register', dataToSubmit);
            setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (e) {
            console.error("Error during registration:", e);
            const errorMessage = parseBackendError(e);
            
            // Mostrar error en el campo correspondiente
            if (errorMessage.toLowerCase().includes('correo') || errorMessage.toLowerCase().includes('email')) {
                setErrors({ email: errorMessage });
            } else if (errorMessage.toLowerCase().includes('ingeniero') || errorMessage.toLowerCase().includes('equipo')) {
                setErrors({ rol: errorMessage });
            } else {
                setErrors({ email: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2 min-h-screen bg-dark flex items-center justify-center p-8 py-12 overflow-visible">
            {/* Form Box */}
            <div className="w-full max-w-md lg:mr-16 xl:mr-24">

                {/* Logo */}
                <div className="mb-6 text-center">
                    <img 
                        src={FullLogo} 
                        alt="F1 Garage Logo"
                        className="w-36 h-auto mx-auto"
                    />
                </div>

                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold text-light">Bienvenido</h1>
                        <p className="text-sm text-light">
                            ¿Ya tienes cuenta?{' '}
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="text-primary-hover-underline font-semibold hover:underline">
                                Iniciar sesión
                            </button>
                        </p>
                    </div>
                    <p className="text-light text-sm">
                        Complete la información para crear su cuenta.
                    </p>
                </div>

                {/* Register Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputWithValidation
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre"
                            error={errors.nombre}
                            onClearError={clearError}
                        />
                        
                        <InputWithValidation
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            placeholder="Apellido"
                            error={errors.apellido}
                            onClearError={clearError}
                        />
                    </div>

                    {/* Email */}
                    <InputWithValidation
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Correo electrónico"
                        error={errors.email}
                        onClearError={clearError}
                    />
                    
                    {/* Rol */}
                    <SelectWithValidation
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        error={errors.rol}
                        onClearError={clearError}
                    >
                        <option value="" disabled>Seleccione un rol</option>
                        <option value="Driver">Conductor</option>
                        <option value="Engineer">Ingeniero</option>
                        <option value="Admin">Administrador</option>
                    </SelectWithValidation>

                    {/* Contraseña */}
                    <InputWithValidation
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        error={errors.password}
                        onClearError={clearError}
                        className="pr-12"
                        hint="Mín. 8 caracteres: 4 letras, 4 números, 1 especial"
                    >
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
                    </InputWithValidation>

                    {/* Confirmar Contraseña */}
                    <InputWithValidation
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmar contraseña"
                        error={errors.confirmPassword}
                        onClearError={clearError}
                        className="pr-12"
                    >
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
                    </InputWithValidation>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || successMessage}
                        className={`w-full bg-primary text-white font-semibold py-3 rounded-lg transition-all mt-4 flex items-center justify-center gap-2 ${
                            loading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear cuenta'
                        )}
                    </button>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/40 rounded-lg flex items-center gap-3 animate-fadeIn">
                            <FiCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                            <p className="text-green-300 text-sm font-medium">{successMessage}</p>
                        </div>
                    )}
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}