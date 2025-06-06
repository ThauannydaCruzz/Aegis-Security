import React, { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Shield as ShieldIcon, ChevronRight, Activity } from "lucide-react";


const Index = () => {
  const navigate = useNavigate();
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createParticles = () => {
      const particleContainer = particleContainerRef.current;
      if (particleContainer) {
        particleContainer.innerHTML = ''; // Limpa antes de recriar
        const numberOfParticles = 35;

        for (let i = 0; i < numberOfParticles; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle'; // Estilos definidos no CSS global

          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;

          const sizeNum = Math.random() * 2 + 1; // Tamanho das partículas: 1px a 3px
          particle.style.width = `${sizeNum}px`;
          particle.style.height = `${sizeNum}px`;

          const delay = Math.random() * 5;
          particle.style.animationDelay = `${delay}s`;

          particleContainer.appendChild(particle);

          void particle.offsetWidth;
          particle.style.opacity = '1';
        }
      }
    };

    createParticles();
    window.addEventListener('resize', createParticles);

    return () => {
      window.removeEventListener('resize', createParticles);
      if (particleContainerRef.current) {
        particleContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    // Container principal: ocupa toda a tela e ESCONDE OVERFLOW.
    // Herda altura/largura do #root (que é 100vh/100vw via CSS global)
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
      <div ref={particleContainerRef} id="particle-container" className="fixed inset-0 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-15%] w-[130%] h-[50%] bg-aegis-purple/15 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      <Navbar /> {/* Sua Navbar ajustada */}

      {/* Conteúdo principal com flex-grow para empurrar o footer para baixo */}
      <main className="relative flex-grow w-full flex flex-col items-center justify-center px-4 sm:px-6 z-10 text-center
                       py-6 sm:py-8 md:py-10"> {/* Paddings verticais mais generosos */}

        <div className="mb-4 sm:mb-5 flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-aegis-purple/20 backdrop-blur-sm rounded-full border border-aegis-purple/30 text-xs sm:text-sm shadow-md cursor-default">
          <Activity
            className="h-[14px] w-[14px] sm:h-[16px] sm:w-[16px] text-aegis-purple"
          />
          Segurança de Precisão
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl sm:max-w-5xl mb-3 sm:mb-4 title-glow">
          Inteligência adaptativa,
          <br />proteção atemporal
        </h1>

        <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl md:max-w-3xl mb-6 sm:mb-10 leading-relaxed">
          Experimente o futuro da cibersegurança — projetada para adaptar, evoluir e salvaguardar
          as fundações críticas do seu sucesso.
        </p>

        <Button
          className="px-6 sm:px-8 py-3 sm:py-3.5 bg-aegis-purple hover:bg-aegis-purple/80 text-white rounded-lg text-base sm:text-lg font-semibold shadow-lg hover:shadow-aegis-purple/40 transform hover:scale-105 transition-all duration-300 ease-in-out group"
          onClick={() => navigate('/login')}
        >
          Comece Agora
          <ChevronRight
            className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px] ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>

        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 relative flex flex-col items-center"> {/* Margem superior aumentada */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 flex items-center justify-center"> {/* Escudo maior */}
            <ShieldIcon
              className="w-full h-full text-aegis-purple shield-icon-glow"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 -z-10 bg-aegis-purple/10 rounded-full blur-xl shield-background-glow pointer-events-none"></div>
            <div className="absolute inset-[-15px] sm:inset-[-20px] md:inset-[-25px] -z-10 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`shield-particle-${i}`}
                  className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-aegis-purple/60 rounded-full blur-[1px] sm:blur-[1.5px] animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${4 + Math.random() * 2.5}s`,
                    opacity: Math.random() * 0.35 + 0.2,
                  }}
                ></div>
              ))}
            </div>
          </div>

          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-white/60">Aegis Protection Suite</p> {/* Texto maior */}
        </div>
      </main>

      {/* RODAPÉ REMOVIDO PARA TESTE
      <footer className="relative z-10 text-center py-3 sm:py-4 text-xs sm:text-sm text-white/40 w-full">
        © {new Date().getFullYear()} Aegis Security. Todos os direitos reservados.
      </footer>
      */}
    </div>
  );
};

export default Index;