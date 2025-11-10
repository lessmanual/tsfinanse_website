import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImage from "figma:asset/e7cb9f83cdfc3c2f2787ef5563fe0bb4d2e9b9bf.png";
import logoAvif from "../assets/logo.avif";
import logoWebp from "../assets/logo.webp";
import { useScrollThreshold } from "../hooks/useScrollThreshold";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  // Show logo in navigation after scrolling past hero section (approx 400px)
  const isScrolled = useScrollThreshold(400);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#3D1F1F]/8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - visible on non-home pages or after scroll on home */}
          <div className="flex items-center">
            {isHomePage ? (
              <button
                onClick={() => scrollToSection("hero")}
                className={`flex items-center gap-3 group transition-all duration-500 ${
                  isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                }`}
              >
                <picture>
                  <source type="image/avif" srcSet={logoAvif} />
                  <source type="image/webp" srcSet={logoWebp} />
                  <img
                    src={logoImage}
                    alt="TS Finanse Logo"
                    className="h-16 w-auto"
                    width="1000"
                    height="1000"
                    loading="eager"
                  />
                </picture>
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-3 group"
              >
                <picture>
                  <source type="image/avif" srcSet={logoAvif} />
                  <source type="image/webp" srcSet={logoWebp} />
                  <img
                    src={logoImage}
                    alt="TS Finanse Logo"
                    className="h-16 w-auto"
                    width="1000"
                    height="1000"
                    loading="eager"
                  />
                </picture>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("about")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              O nas
            </button>
            <button
              onClick={() => scrollToSection("conditions")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              Warunki
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              Proces
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              FAQ
            </button>
            <Link
              to="/programpartnerski"
              className="text-[#3D1F1F]/70 hover:text-[#3D1F1F] transition-colors"
            >
              Program Partnerski
            </Link>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-6 py-2.5 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Kontakt
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#3D1F1F]"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#3D1F1F]/8 bg-white">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection("about")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              O nas
            </button>
            <button
              onClick={() => scrollToSection("conditions")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              Warunki
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              Proces
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              FAQ
            </button>
            <Link
              to="/programpartnerski"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-[#3D1F1F]/70 hover:text-[#3D1F1F] hover:bg-[#D4AF7A]/10 rounded-lg transition-colors"
            >
              Program Partnerski
            </Link>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full px-4 py-2.5 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-colors"
            >
              Kontakt
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
