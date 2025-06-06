import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // Certifique-se que este hook existe e funciona

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isIndexPage = location.pathname === '/';
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };
  
  const navbarVerticalPadding = 'py-3 sm:py-4'; // Padding vertical otimizado

  return (
    <>
      <nav className={`absolute top-0 left-0 right-0 w-full ${navbarVerticalPadding} px-4 md:px-6 lg:px-10 flex items-center justify-between z-20`}>
        <div 
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer overflow-hidden flex-shrink-0 mr-2" // Prev
          onClick={() => navigateTo('/')}
          title="Ir para a página inicial"
        >
          <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-aegis-purple flex-shrink-0" />
          <div className="text-lg sm:text-xl font-bold text-white truncate"> 
            <span className="aegis-gradient-text">Aegis</span>
          </div>
        </div>
        
        {!isIndexPage && !location.pathname.includes('/login') && (
          <>
            {isMobile ? (
              <button 
                className="text-white p-2 focus:outline-none"
                onClick={toggleMobileMenu}
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            ) : (
              <div className="flex items-center gap-3 md:gap-5 text-white/80 text-xs sm:text-sm">
                <button className="hover:text-white transition-colors" onClick={() => navigateTo('/aegis-team')}>
                  Sobre
                </button>
                <button className="hover:text-white transition-colors" onClick={() => navigateTo('/security-dashboard')}>
                  Dashboard
                </button>
                <button className="hover:text-white transition-colors" onClick={() => navigateTo('/chatbot')}>
                  IA Segurança
                </button>
                <button className="px-3 py-1.5 bg-aegis-purple rounded-md text-white hover:bg-aegis-purple/90 transition-colors text-xs sm:text-sm" onClick={() => navigateTo('/login')}>
                  Login
                </button>
                <button className="px-3 py-1.5 bg-white text-aegis-purple rounded-md hover:bg-white/90 transition-colors text-xs sm:text-sm" onClick={() => navigateTo('/register')}> 
                  Comece Agora
                </button>
              </div>
            )}
          </>
        )}
      </nav>
      
      {/* Mobile Menu Overlay (estilos no CSS global) */}
      {isMobile && (
        <div className={`mobile-menu-container ${mobileMenuOpen ? 'mobile-menu-open' : 'mobile-menu-closed'}`}>
          <div className="flex justify-end p-4">
            <button 
              className="text-white p-2 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 mt-12 text-white/90">
            <button className="text-lg hover:text-white transition-colors" onClick={() => navigateTo('/aegis-team')}>
              Sobre
            </button>
            <button className="text-lg hover:text-white transition-colors" onClick={() => navigateTo('/security-dashboard')}>
              Dashboard
            </button>
            <button className="text-lg hover:text-white transition-colors" onClick={() => navigateTo('/chatbot')}>
              IA Segurança
            </button>
            <button className="px-6 py-2 mt-4 bg-aegis-purple rounded-md text-white hover:bg-aegis-purple/90 transition-colors text-lg" onClick={() => navigateTo('/login')}>
              Login
            </button>
            <button className="px-6 py-2 mt-2 bg-white text-aegis-purple rounded-md hover:bg-white/90 transition-colors text-lg" onClick={() => navigateTo('/register')}>
              Comece Agora
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;