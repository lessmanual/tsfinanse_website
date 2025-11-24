import { ArrowRight, Phone, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import heroBackground from 'figma:asset/0a00d157a774d4a1c538fd2cb05101097bebd8d5.png';
import hero640Avif from '../assets/hero-640w.avif';
import hero1280Avif from '../assets/hero-1280w.avif';
import hero1920Avif from '../assets/hero-1920w.avif';
import hero640Webp from '../assets/hero-640w.webp';
import hero1280Webp from '../assets/hero-1280w.webp';
import hero1920Webp from '../assets/hero-1920w.webp';
import logoImage from 'figma:asset/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png';
import logoAvif from '../assets/logo.avif';
import logoWebp from '../assets/logo.webp';
import { useScrollThreshold } from '../hooks/useScrollThreshold';

export function Hero() {
  // Hide logo from hero after scrolling past 400px
  const isScrolled = useScrollThreshold(400);
  const [isMobile, setIsMobile] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCallClick = async () => {
    if (!phoneRevealed) {
      setPhoneRevealed(true);
    } else {
      try {
        await navigator.clipboard.writeText('+48506711242');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy phone number:', err);
      }
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <style>{`
          .hero-bg-image {
            object-position: 52% center;
          }
          @media (min-width: 768px) {
            .hero-bg-image {
              object-position: 54% center;
            }
          }
        `}</style>
        <picture>
          {/* AVIF sources (best compression) */}
          <source
            type="image/avif"
            srcSet={`${hero640Avif} 640w, ${hero1280Avif} 1280w, ${hero1920Avif} 1920w`}
            sizes="100vw"
          />
          {/* WebP sources (good compression, wider support) */}
          <source
            type="image/webp"
            srcSet={`${hero640Webp} 640w, ${hero1280Webp} 1280w, ${hero1920Webp} 1920w`}
            sizes="100vw"
          />
          {/* Fallback PNG */}
          <img
            src={heroBackground}
            alt="Modern business architecture"
            className="w-full h-full object-cover hero-bg-image"
            width="1408"
            height="768"
            loading="eager"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D1F1F]/85 via-[#3D1F1F]/75 to-[#2A1414]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-full max-w-4xl mx-auto">
          {/* Logo - visible at top, fades out on scroll */}
          <div
            className={`mb-4 sm:mb-8 md:mb-12 transition-all duration-500 relative flex items-center justify-center ${
              isScrolled ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Multi-layer radial glow effect behind logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-[44px] bg-[rgba(254,254,254,0.24)] opacity-20 blur-[60px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-[#FEFEFE] opacity-30 blur-[40px] pointer-events-none" />

            <picture>
              <source type="image/avif" srcSet={logoAvif} />
              <source type="image/webp" srcSet={logoWebp} />
              <img
                src={logoImage}
                alt="TS Finanse Logo"
                className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto object-contain relative z-10"
                width="1000"
                height="1000"
                loading="eager"
              />
            </picture>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#D4AF7A]/15 backdrop-blur-md border border-[#D4AF7A]/25 rounded-full mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base">
            <span className="text-[#D4AF7A]">Bezpieczne Finansowanie dla Przedsiębiorców</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-4 sm:mb-5 md:mb-8 text-[#FEFEFE]">
            <span className="block text-5xl sm:text-6xl lg:text-7xl mb-2 sm:mb-3 md:mb-5 tracking-tight">
              Pożyczki dla Biznesu
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl text-[#D4AF7A] tracking-tight">
              pod Zabezpieczenie Hipoteczne
            </span>
          </h1>

          {/* Subheading */}
          <div className="mb-6 sm:mb-10 md:mb-14 space-y-2 sm:space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl text-[#FEFEFE]/95">
              Od 1 do 20 milionów złotych
            </p>
            <p className="text-xs sm:text-sm text-white italic">
              *Pozostałe rozpatrywane indywidualnie
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                <span className="text-[#FEFEFE]/90">Decyzja w 3 dni robocze</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                <span className="text-[#FEFEFE]/90">Niezależni od banków</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF7A]" />
                <span className="text-[#FEFEFE]/90">Własny kapitał</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-9 sm:py-4 bg-[#D4AF7A] text-[#3D1F1F] rounded-lg hover:bg-[#E8D4B8] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span className="sm:text-lg">Wyślij zapytanie</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            {isMobile ? (
              <a
                href="tel:+48506711242"
                className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-9 sm:py-4 bg-[#3D1F1F] text-white border-2 border-[#3D1F1F] rounded-lg hover:bg-[#2A1414] hover:border-[#2A1414] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Phone size={20} />
                <span className="sm:text-lg">Zadzwoń</span>
              </a>
            ) : (
              <button
                onClick={handleCallClick}
                className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-9 sm:py-4 bg-[#3D1F1F] text-white border-2 border-[#3D1F1F] rounded-lg hover:bg-[#2A1414] hover:border-[#2A1414] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                {copied ? (
                  <>
                    <Check size={20} />
                    <span className="sm:text-lg">Skopiowano!</span>
                  </>
                ) : phoneRevealed ? (
                  <>
                    <Phone size={20} />
                    <span className="sm:text-lg">+48 506 711 242</span>
                  </>
                ) : (
                  <>
                    <Phone size={20} />
                    <span className="sm:text-lg">Zadzwoń</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F0] to-transparent z-10" />
    </section>
  );
}
