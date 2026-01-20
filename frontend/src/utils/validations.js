/**
 * Validaciones para formularios de autenticación
 */

// ========== VALIDACIONES DE CONTRASEÑA ==========
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Contar letras
  const letterCount = (password.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < 4) {
    errors.push('La contraseña debe tener al menos 4 letras');
  }

  // Contar números
  const numberCount = (password.match(/[0-9]/g) || []).length;
  if (numberCount < 4) {
    errors.push('La contraseña debe tener al menos 4 números');
  }

  // Caracter especial
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (!specialChars.test(password)) {
    errors.push('La contraseña debe tener al menos 1 caracter especial (!@#$%^&*...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIONES DE EMAIL ==========
export const validateEmail = (email) => {
  const errors = [];

  // Formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('El formato del correo electrónico no es válido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIONES DE NOMBRE ==========
export const validateName = (name, fieldName = 'Nombre') => {
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push(`${fieldName} es obligatorio`);
    return { isValid: false, errors };
  }

  // No permitir espacios
  if (/\s/.test(name)) {
    errors.push(`${fieldName} no puede contener espacios`);
  }

  // Solo letras y tildes
  const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/;
  if (!validNameRegex.test(name)) {
    errors.push(`${fieldName} solo puede contener letras`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIÓN DE ROL ==========
export const validateRole = (role) => {
  const errors = [];

  if (!role || role === '') {
    errors.push('Debes seleccionar un rol');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIÓN DE CONFIRMACIÓN DE CONTRASEÑA ==========
export const validatePasswordMatch = (password, confirmPassword) => {
  const errors = [];

  if (password !== confirmPassword) {
    errors.push('Las contraseñas no coinciden');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIÓN COMPLETA DE REGISTRO ==========
export const validateRegisterForm = (formData) => {
  const allErrors = [];

  // Validar nombre
  const nombreValidation = validateName(formData.nombre, 'Nombre');
  allErrors.push(...nombreValidation.errors);

  // Validar apellido
  const apellidoValidation = validateName(formData.apellido, 'Apellido');
  allErrors.push(...apellidoValidation.errors);

  // Validar email
  const emailValidation = validateEmail(formData.email);
  allErrors.push(...emailValidation.errors);

  // Validar rol
  const rolValidation = validateRole(formData.rol);
  allErrors.push(...rolValidation.errors);

  // Validar contraseña
  const passwordValidation = validatePassword(formData.password);
  allErrors.push(...passwordValidation.errors);

  // Validar confirmación de contraseña
  const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
  allErrors.push(...passwordMatchValidation.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// ========== VALIDACIÓN COMPLETA DE LOGIN ==========
export const validateLoginForm = (credentials) => {
  const allErrors = [];

  // Validar email
  if (!credentials.email || credentials.email.trim() === '') {
    allErrors.push('El correo electrónico es obligatorio');
  } else {
    const emailValidation = validateEmail(credentials.email);
    allErrors.push(...emailValidation.errors);
  }

  // Validar contraseña
  if (!credentials.password || credentials.password === '') {
    allErrors.push('La contraseña es obligatoria');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// ========== MENSAJES DE ERROR DEL BACKEND ==========
export const parseBackendError = (error) => {
  const errorMessage = error?.response?.data?.error || error?.message || '';

  // Detectar errores específicos del backend
  if (errorMessage.includes('correo electrónico ya está registrado') || 
      errorMessage.includes('email ya existe') ||
      errorMessage.includes('duplicate') ||
      errorMessage.includes('ya está registrado')) {
    return 'Este correo electrónico ya está en uso';
  }

  if (errorMessage.includes('Usuario no encontrado') ||
      errorMessage.includes('Invalid email or password')) {
    return 'Correo electrónico o contraseña incorrectos';
  }

  if (errorMessage.includes('inactivo')) {
    return 'Esta cuenta ha sido desactivada';
  }

  // Error genérico
  return errorMessage || 'Ha ocurrido un error. Intenta nuevamente.';
};