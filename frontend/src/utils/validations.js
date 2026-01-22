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

// ========== VALIDACIONES DE EQUIPO ==========
export const validateTeamName = (nombre) => {
  const errors = [];

  if (!nombre || nombre.trim() === '') {
    errors.push('El nombre del equipo es obligatorio');
    return { isValid: false, errors };
  }

  if (nombre.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  }

  if (nombre.trim().length > 120) {
    errors.push('El nombre no puede superar 120 caracteres');
  }

  // Solo letras, números, espacios y guiones
  const validNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-]+$/;
  if (!validNameRegex.test(nombre)) {
    errors.push('El nombre solo puede contener letras, números, espacios y guiones');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIONES DE DRIVER ==========
export const validateDriverName = (nombre) => {
  const errors = [];

  if (!nombre || nombre.trim() === '') {
    errors.push('El nombre del driver es obligatorio');
    return { isValid: false, errors };
  }

  if (nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (nombre.trim().length > 120) {
    errors.push('El nombre no puede superar 120 caracteres');
  }

  // Solo letras, espacios y tildes
  const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!validNameRegex.test(nombre)) {
    errors.push('Solo puede contener letras y espacios');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDriverSkill = (habilidad) => {
  const errors = [];
  const skill = Number(habilidad);

  if (isNaN(skill)) {
    errors.push('La habilidad debe ser un número');
    return { isValid: false, errors };
  }

  if (skill < 0 || skill > 100) {
    errors.push('La habilidad debe estar entre 0 y 100');
  }

  if (!Number.isInteger(skill)) {
    errors.push('La habilidad debe ser un número entero');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIONES DE PATROCINADOR ==========
export const validateSponsorName = (nombre) => {
  const errors = [];

  if (!nombre || nombre.trim() === '') {
    errors.push('El nombre del patrocinador es obligatorio');
    return { isValid: false, errors };
  }

  if (nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  if (nombre.trim().length > 120) {
    errors.push('El nombre no puede superar 120 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSponsorEmail = (email) => {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('El email del patrocinador es obligatorio');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('El formato del email no es válido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ========== VALIDACIONES DE APORTE ==========
export const validateAporteMonto = (monto) => {
  const errors = [];
  const amount = Number(monto);

  if (!monto || monto === '') {
    errors.push('El monto es obligatorio');
    return { isValid: false, errors };
  }

  if (isNaN(amount)) {
    errors.push('El monto debe ser un número');
    return { isValid: false, errors };
  }

  if (amount <= 1000) {
    errors.push('El monto debe ser mayor a 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAporteEquipo = (idEquipo) => {
  const errors = [];

  if (!idEquipo || Number(idEquipo) === 0) {
    errors.push('Debes seleccionar un equipo');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};