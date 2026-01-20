import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { FiCheckCircle } from 'react-icons/fi'
import FullLogo from '../../assets/logo/full-logo-white.png';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { InputWithValidation } from '../common/Validation';
import { validateEmail, parseBackendError } from '../../utils/validations';

/**
 * Login Form Component
 * Displays login form with email and password fields with inline validation
 */
export function LoginForm({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const clearError = (fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!credentials.email || credentials.email.trim() === '') {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailValidation = validateEmail(credentials.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.errors[0];
      }
    }

    // Validar contraseña
    if (!credentials.password || credentials.password === '') {
      newErrors.password = 'La contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (e) {
      console.error("Error during login:", e);
      const errorMessage = parseBackendError(e);
      
      // Mostrar error en el campo más relevante
      if (errorMessage.toLowerCase().includes('correo') || errorMessage.toLowerCase().includes('usuario')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('contraseña')) {
        setErrors({ password: errorMessage });
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 h-screen bg-dark flex items-center justify-center p-8 overflow-visible">
      {/* Form Box - con espacio extra a la derecha para los popups en desktop */}
      <div className="w-full max-w-md lg:mr-16 xl:mr-24">

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
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <InputWithValidation
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            error={errors.email}
            onClearError={clearError}
          />

          {/* Password Input */}
          <InputWithValidation
            type={showPassword ? "text" : "password"}
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Contraseña"
            error={errors.password}
            onClearError={clearError}
            className="pr-12"
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
          
          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || successMessage}
            className={`w-full bg-primary text-white font-semibold py-3 rounded-lg transition-all mt-6 flex items-center justify-center gap-2 ${
              loading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
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
