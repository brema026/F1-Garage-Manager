import { useState, useEffect } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

/**
 * Input con popup de validación responsive
 * - Desktop: popup a la derecha del campo
 * - Mobile: popup debajo del campo
 */
export function InputWithValidation({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  onClearError,
  className = '',
  children, // Para elementos adicionales como el botón de mostrar contraseña
  hint, // Texto de ayuda debajo del input
}) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        onClearError && onClearError(name);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, name, onClearError]);

  const handleDismiss = () => {
    setShowError(false);
    onClearError && onClearError(name);
  };

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-white border rounded-lg text-dark placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
            error && showError
              ? 'border-red-500 focus:ring-red-500/30'
              : 'border-gray-300 focus:ring-primary'
          } ${className}`}
        />
        {children}
      </div>

      {/* Hint text */}
      {hint && !error && (
        <p className="text-[10px] text-light/40 mt-1 ml-1">{hint}</p>
      )}

      {/* Error Popup */}
      {error && showError && (
        <>
          {/* Desktop: Popup a la derecha */}
          <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50">
            <div className="relative animate-fadeIn">
              {/* Flecha izquierda */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-red-500/90"></div>
              </div>
              
              {/* Card */}
              <div className="bg-gradient-to-r from-red-500/95 to-red-600/95 backdrop-blur-xl rounded-lg px-4 py-2.5 shadow-2xl shadow-red-500/20 border border-red-400/30 min-w-[200px] max-w-[280px]">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-white text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-white text-xs font-medium flex-1 leading-relaxed">{error}</p>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet: Popup debajo */}
          <div className="lg:hidden absolute left-0 right-0 top-full mt-2 z-50">
            <div className="relative animate-fadeIn">
              {/* Flecha arriba */}
              <div className="absolute left-6 -top-2">
                <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-red-500/90"></div>
              </div>
              
              {/* Card */}
              <div className="bg-gradient-to-r from-red-500/95 to-red-600/95 backdrop-blur-xl rounded-lg px-4 py-2.5 shadow-2xl shadow-red-500/20 border border-red-400/30">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-white text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-white text-xs font-medium flex-1 leading-relaxed">{error}</p>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Select con popup de validación responsive
 */
export function SelectWithValidation({
  name,
  value,
  onChange,
  error,
  onClearError,
  className = '',
  children, // Options
}) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        onClearError && onClearError(name);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, name, onClearError]);

  const handleDismiss = () => {
    setShowError(false);
    onClearError && onClearError(name);
  };

  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-white border rounded-lg text-dark focus:outline-none focus:ring-2 transition-all ${
          error && showError
            ? 'border-red-500 focus:ring-red-500/30'
            : 'border-gray-300 focus:ring-primary'
        } ${className}`}
      >
        {children}
      </select>

      {/* Error Popup */}
      {error && showError && (
        <>
          {/* Desktop */}
          <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50">
            <div className="relative animate-fadeIn">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-red-500/90"></div>
              </div>
              <div className="bg-gradient-to-r from-red-500/95 to-red-600/95 backdrop-blur-xl rounded-lg px-4 py-2.5 shadow-2xl shadow-red-500/20 border border-red-400/30 min-w-[200px] max-w-[280px]">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-white text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-white text-xs font-medium flex-1 leading-relaxed">{error}</p>
                  <button type="button" onClick={handleDismiss} className="text-white/70 hover:text-white transition-colors flex-shrink-0">
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden absolute left-0 right-0 top-full mt-2 z-50">
            <div className="relative animate-fadeIn">
              <div className="absolute left-6 -top-2">
                <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-red-500/90"></div>
              </div>
              <div className="bg-gradient-to-r from-red-500/95 to-red-600/95 backdrop-blur-xl rounded-lg px-4 py-2.5 shadow-2xl shadow-red-500/20 border border-red-400/30">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-white text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-white text-xs font-medium flex-1 leading-relaxed">{error}</p>
                  <button type="button" onClick={handleDismiss} className="text-white/70 hover:text-white transition-colors flex-shrink-0">
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}

export default InputWithValidation;