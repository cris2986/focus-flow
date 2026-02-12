import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'focus-flow-onboarding-completed';

interface Slide {
  icon: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: 'directions_run',
    title: 'Combate el sedentarismo',
    description: 'Focus Flow te ayuda a moverte durante tu jornada laboral con micro-ejercicios de 30-45 segundos diseñados para hacer en tu escritorio.',
  },
  {
    icon: 'psychology',
    title: 'Menos carga mental',
    description: 'La app decide por ti qué ejercicio hacer y cuándo. Solo tienes que seguir las instrucciones cuando llegue el momento.',
  },
  {
    icon: 'lock',
    title: 'Privacidad total',
    description: 'Tus datos se guardan solo en tu dispositivo. Sin cuentas, sin seguimiento, sin gamificación adictiva. Solo tu bienestar.',
  },
];

export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};

export const markOnboardingComplete = (): void => {
  localStorage.setItem(ONBOARDING_KEY, 'true');
};

export const resetOnboarding = (): void => {
  localStorage.removeItem(ONBOARDING_KEY);
};

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleStart = () => {
    markOnboardingComplete();
    navigate('/', { replace: true });
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <div className="flex flex-col h-screen overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark">
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-8 animate-fade-in">
          <span className="material-icons-round text-primary text-5xl">{slide.icon}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 animate-fade-in">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 dark:text-gray-300 text-center leading-relaxed max-w-xs animate-fade-in">
          {slide.description}
        </p>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-8 pt-4 safe-area-bottom">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={isLastSlide ? handleStart : handleNext}
          className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>{isLastSlide ? 'Comenzar' : 'Siguiente'}</span>
          <span className="material-icons-round text-lg">
            {isLastSlide ? 'check' : 'arrow_forward'}
          </span>
        </button>
      </footer>
    </div>
  );
};

export default OnboardingScreen;
