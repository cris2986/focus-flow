import { Exercise, Zone } from '../types';

export const ZONE_LABELS: Record<Zone, string> = {
  cuello: 'Cuello',
  hombros: 'Hombros',
  espalda: 'Espalda',
  cadera: 'Cadera',
  piernas: 'Piernas',
  de_pie: 'De Pie',
};

export const ZONE_COLORS: Record<Zone, string> = {
  cuello: 'bg-purple-500',
  hombros: 'bg-blue-500',
  espalda: 'bg-green-500',
  cadera: 'bg-orange-500',
  piernas: 'bg-red-500',
  de_pie: 'bg-teal-500',
};

export const exercises: Exercise[] = [
  // ZONA: CUELLO
  {
    id: 1,
    name: 'Inclinación lateral de cuello',
    zone: 'cuello',
    posture: 'sitting',
    durationSeconds: 40,
    movement: 'Oreja hacia hombro, alternando lados.',
    objective: 'Liberar tensión cervical lateral.',
    variants: [
      { id: 'suave', name: 'Suave (sostener 5s)' },
      { id: 'fluida', name: 'Fluida (movimiento continuo)' },
    ],
    icon: 'swap_horiz',
    image: '/exercises/exercise_1.png',
  },
  {
    id: 2,
    name: 'Flexión cervical frontal',
    zone: 'cuello',
    posture: 'sitting',
    durationSeconds: 30,
    movement: 'Mentón hacia pecho.',
    objective: 'Descomprimir cervical posterior.',
    variants: [
      { id: 'estatica', name: 'Estática' },
      { id: 'pulsos', name: 'Pulsos cortos' },
    ],
    icon: 'vertical_align_bottom',
    image: '/exercises/exercise_2.png',
  },
  {
    id: 3,
    name: 'Rotación de cuello',
    zone: 'cuello',
    posture: 'sitting',
    durationSeconds: 45,
    movement: 'Girar cabeza derecha/izquierda.',
    objective: 'Movilidad cervical global.',
    variants: [
      { id: 'lenta', name: 'Lenta' },
      { id: 'pausa', name: 'Con pausa final' },
    ],
    icon: 'rotate_right',
    image: '/exercises/exercise_3.png',
  },

  // ZONA: HOMBROS
  {
    id: 4,
    name: 'Elevación y caída de hombros',
    zone: 'hombros',
    posture: 'sitting',
    durationSeconds: 35,
    movement: 'Subir hombros a orejas y soltar.',
    objective: 'Liberar trapecios.',
    variants: [
      { id: 'lento', name: 'Lento' },
      { id: 'ritmico', name: 'Rítmico' },
    ],
    icon: 'unfold_more',
    image: '/exercises/exercise_4.png',
  },
  {
    id: 5,
    name: 'Rotación de hombros',
    zone: 'hombros',
    posture: 'sitting',
    durationSeconds: 40,
    movement: 'Círculos hacia atrás.',
    objective: 'Activar cintura escapular.',
    variants: [
      { id: 'amplio', name: 'Amplio' },
      { id: 'reducido', name: 'Reducido' },
    ],
    icon: 'sync',
    image: '/exercises/exercise_5.png',
  },
  {
    id: 6,
    name: 'Retracción escapular',
    zone: 'hombros',
    posture: 'sitting',
    durationSeconds: 45,
    movement: 'Juntar omóplatos suavemente.',
    objective: 'Contrarrestar postura encorvada.',
    variants: [
      { id: 'sosten', name: 'Sostén' },
      { id: 'pulsos', name: 'Pulsos' },
    ],
    icon: 'compress',
    image: '/exercises/exercise_6.png',
  },

  // ZONA: ESPALDA
  {
    id: 7,
    name: 'Extensión torácica sentada',
    zone: 'espalda',
    posture: 'sitting',
    durationSeconds: 40,
    movement: 'Abrir pecho, llevar brazos atrás.',
    objective: 'Movilidad dorsal.',
    variants: [
      { id: 'estatica', name: 'Estática' },
      { id: 'fluida', name: 'Fluida' },
    ],
    icon: 'open_in_full',
    image: '/exercises/exercise_7.png',
  },
  {
    id: 8,
    name: 'Gato–vaca sentado',
    zone: 'espalda',
    posture: 'sitting',
    durationSeconds: 45,
    movement: 'Redondear y extender columna.',
    objective: 'Lubricar columna.',
    variants: [
      { id: 'lento', name: 'Lento' },
      { id: 'continuo', name: 'Continuo' },
    ],
    icon: 'waves',
    image: '/exercises/exercise_8.png',
  },
  {
    id: 9,
    name: 'Rotación torácica',
    zone: 'espalda',
    posture: 'sitting',
    durationSeconds: 35,
    movement: 'Girar torso desde la cintura.',
    objective: 'Liberar rigidez dorsal.',
    variants: [
      { id: 'alternada', name: 'Alternada' },
      { id: 'pausa', name: 'Con pausa' },
    ],
    icon: 'autorenew',
    image: '/exercises/exercise_9.png',
  },

  // ZONA: CADERA
  {
    id: 10,
    name: 'Apertura de cadera sentada',
    zone: 'cadera',
    posture: 'sitting',
    durationSeconds: 40,
    movement: 'Rodilla hacia afuera.',
    objective: 'Movilidad de cadera.',
    variants: [
      { id: 'estatica', name: 'Estática' },
      { id: 'pulsos', name: 'Pulsos' },
    ],
    icon: 'open_with',
    image: '/exercises/exercise_10.png',
  },
  {
    id: 11,
    name: 'Flexión de cadera alterna',
    zone: 'cadera',
    posture: 'sitting',
    durationSeconds: 35,
    movement: 'Elevar rodilla.',
    objective: 'Activar flexores.',
    variants: [
      { id: 'alternada', name: 'Alternada' },
      { id: 'sosten', name: 'Sostén' },
    ],
    icon: 'keyboard_arrow_up',
    image: '/exercises/exercise_11.png',
  },
  {
    id: 12,
    name: 'Balanceo pélvico',
    zone: 'cadera',
    posture: 'sitting',
    durationSeconds: 45,
    movement: 'Basculación adelante/atrás.',
    objective: 'Descomprimir zona lumbar.',
    variants: [
      { id: 'lento', name: 'Lento' },
      { id: 'fluido', name: 'Fluido' },
    ],
    icon: 'swap_vert',
    image: '/exercises/exercise_12.png',
  },

  // ZONA: PIERNAS
  {
    id: 13,
    name: 'Elevación de talones',
    zone: 'piernas',
    posture: 'sitting',
    durationSeconds: 30,
    movement: 'Subir y bajar talones.',
    objective: 'Activar circulación.',
    variants: [
      { id: 'bilateral', name: 'Bilateral' },
      { id: 'alternada', name: 'Alternada' },
    ],
    icon: 'height',
    image: '/exercises/exercise_13.png',
  },
  {
    id: 14,
    name: 'Extensión de rodilla',
    zone: 'piernas',
    posture: 'sitting',
    durationSeconds: 40,
    movement: 'Extender pierna al frente.',
    objective: 'Activar cuádriceps.',
    variants: [
      { id: 'alternada', name: 'Alternada' },
      { id: 'sosten', name: 'Sostén' },
    ],
    icon: 'straighten',
    image: '/exercises/exercise_14.png',
  },
  {
    id: 15,
    name: 'Movilidad de tobillos',
    zone: 'piernas',
    posture: 'sitting',
    durationSeconds: 30,
    movement: 'Círculos con el pie.',
    objective: 'Lubricar articulación.',
    variants: [
      { id: 'amplio', name: 'Amplio' },
      { id: 'reducido', name: 'Reducido' },
    ],
    icon: 'rotate_90_degrees_ccw',
    image: '/exercises/exercise_15.png',
  },

  // ZONA: DE PIE (complementarios)
  {
    id: 16,
    name: 'Estiramiento de columna de pie',
    zone: 'de_pie',
    posture: 'standing',
    durationSeconds: 35,
    movement: 'Brazos arriba, elongar.',
    objective: 'Descompresión global.',
    variants: [
      { id: 'sosten', name: 'Sostén' },
      { id: 'balanceo', name: 'Balanceo suave' },
    ],
    icon: 'expand',
    image: '/exercises/exercise_16.png',
  },
  {
    id: 17,
    name: 'Bisagra de cadera corta',
    zone: 'de_pie',
    posture: 'standing',
    durationSeconds: 30,
    movement: 'Inclinar torso manteniendo espalda neutra.',
    objective: 'Activar cadena posterior.',
    variants: [
      { id: 'corto', name: 'Corto' },
      { id: 'controlado', name: 'Controlado' },
    ],
    icon: 'turn_right',
    image: '/exercises/exercise_17.png',
  },
  {
    id: 18,
    name: 'Sentadilla parcial',
    zone: 'de_pie',
    posture: 'standing',
    durationSeconds: 45,
    movement: 'Flexión leve de rodillas.',
    objective: 'Activar piernas sin fatiga.',
    variants: [
      { id: 'pulsos', name: 'Pulsos' },
      { id: 'sosten', name: 'Sostén' },
    ],
    icon: 'download',
    image: '/exercises/exercise_18.png',
  },
];

// Helpers
export const getExercisesByZone = (zone: Zone): Exercise[] =>
  exercises.filter((e) => e.zone === zone);

export const getExercisesByPosture = (posture: 'sitting' | 'standing'): Exercise[] =>
  exercises.filter((e) => e.posture === posture);

export const getExerciseById = (id: number): Exercise | undefined =>
  exercises.find((e) => e.id === id);

export const getRandomExercise = (posture?: 'sitting' | 'standing'): Exercise => {
  const filtered = posture ? getExercisesByPosture(posture) : exercises;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
