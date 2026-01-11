import img1 from '../assets/login/1.jpg';
import img2 from '../assets/login/2.jpg';
import img3 from '../assets/login/3.jpg';

export const CAROUSEL_IMAGES = [
  { id: 1, src: img1, alt: 'Carousel 1' },
  { id: 2, src: img2, alt: 'Carousel 2' },
  { id: 3, src: img3, alt: 'Carousel 3' },
]

export const CAROUSEL_INTERVAL = 5000;

// Categorías
export const CATEGORIAS = [
  'Todas',
  'Unidad de potencia',
  'Paquete aerodinámico',
  'Neumáticos',
  'Suspensión',
  'Caja de cambios'
];

// Categorías para CarSetup
export const CARSETUP_CATEGORIES = [
  'Unidad de Potencia',
  'Paquete Aerodinámico',
  'Neumáticos',
  'Suspensión',
  'Caja de Cambios'
];

// Estados de carros
export const CAR_STATUS = {
  PENDIENTE: 'pendiente',
  EN_CONFIGURACION: 'en_configuracion',
  FINALIZADO: 'finalizado'
};

// Colores de habilidad
export const SKILL_LEVELS = {
  EXCELENTE: 90,
  MUY_BUENO: 80,
  BUENO: 70,
  REGULAR: 60,
};