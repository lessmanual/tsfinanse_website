import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 50px
      if (window.scrollY > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check on mount
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={{ zIndex: 9999, bottom: '7rem', right: '1.5rem' }}
      className="fixed p-4 sm:p-5 bg-[#3D1F1F] text-white rounded-full shadow-2xl hover:bg-[#2A1414] transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#3D1F1F]/30 border-2 border-white/10 sm:right-[2rem]"
      aria-label="Przewiń do góry"
    >
      <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7" />
    </button>
  );
}
