// src/components/AegisFaceAnimation.tsx
import React, { useEffect, useState } from "react";
import {
  FACE_EXPRESSIONS,
  EYE_BLINK_INTERVAL_MIN,
  EYE_BLINK_INTERVAL_RANGE,
  EYE_BLINK_DURATION,
  TALK_ANIMATION_DURATION_MIN,
  TALK_ANIMATION_DURATION_RANGE,
  EYE_SHIFT_DURATION,
} from "../constants/constants";

interface AegisFaceAnimationProps {
  isTyping: boolean;
  overallTypingComplete: boolean;
}

interface EyeShift {
  x: number;
  y: number;
}

const AegisFaceAnimation: React.FC<AegisFaceAnimationProps> = ({
  isTyping,
  overallTypingComplete,
}) => {
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [eyeShift, setEyeShift] = useState<EyeShift>({ x: 0, y: 0 });
  const [faceExpression, setFaceExpression] = useState<string>("neutral");

  // Efeito para piscar os olhos
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), EYE_BLINK_DURATION);
    }, Math.random() * EYE_BLINK_INTERVAL_RANGE + EYE_BLINK_INTERVAL_MIN);
    return () => clearInterval(blinkInterval);
  }, []);

  // Efeito para animação de "fala" durante a digitação
  useEffect(() => {
    if (isTyping) {
      if (Math.random() > 0.6) {
        setIsTalking(true);
        setTimeout(
          () => setIsTalking(false),
          Math.random() * TALK_ANIMATION_DURATION_RANGE +
            TALK_ANIMATION_DURATION_MIN
        );
      }
      if (Math.random() > 0.9) {
        const shift: EyeShift = {
          x: (Math.random() * 2 - 1) * 2,
          y: Math.random() * 2 - 1,
        };
        setEyeShift(shift);
        setTimeout(() => setEyeShift({ x: 0, y: 0 }), EYE_SHIFT_DURATION);
      }
    }
  }, [isTyping]);

  // Efeito para expressões faciais após a digitação estar completa
  useEffect(() => {
    if (overallTypingComplete) {
      setFaceExpression("friendly");
      const expressionInterval = setInterval(() => {
        setFaceExpression(
          FACE_EXPRESSIONS[Math.floor(Math.random() * FACE_EXPRESSIONS.length)]
        );
        if (Math.random() > 0.7) {
          setEyeShift({
            x: (Math.random() * 2 - 1) * 2,
            y: Math.random() * 2 - 1,
          });
          setTimeout(() => setEyeShift({ x: 0, y: 0 }), EYE_SHIFT_DURATION);
        }
        if (Math.random() > 0.8) {
          setIsTalking(true);
          setTimeout(
            () => setIsTalking(false),
            Math.random() * TALK_ANIMATION_DURATION_RANGE +
              TALK_ANIMATION_DURATION_MIN
          );
        }
      }, 3000 + Math.random() * 2000);
      return () => clearInterval(expressionInterval);
    } else {
      setFaceExpression("neutral");
      setIsTalking(false);
    }
  }, [overallTypingComplete]);

  return (
    <div className="relative w-64 h-64 mb-10">
      {/* Efeitos de brilho de fundo */}
      <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-aegis-purple/40 to-transparent blur-xl animate-pulse"></div>
      <div
        className="absolute w-3/4 h-3/4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-aegis-purple/60 to-transparent blur-lg animate-pulse"
        style={{ animationDelay: "0.3s" }}
      ></div>
      <div
        className="absolute w-1/2 h-1/2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-aegis-purple/80 to-transparent blur-md animate-pulse"
        style={{ animationDelay: "0.6s" }}
      ></div>

      {/* Elementos da face */}
      <div className="absolute w-full h-full flex items-center justify-center">
        <div className="relative w-20 h-20">
          {/* Olho Esquerdo */}
          <div
            className={`absolute top-6 left-3 w-3 ${
              isBlinking ? "h-[2px]" : "h-[12px]"
            } bg-white rounded-full transition-all duration-100`}
            style={{
              transform: `translate(${eyeShift.x}px, ${eyeShift.y}px)`,
              opacity: faceExpression === "thoughtful" ? 0.9 : 1,
            }}
          ></div>
          {/* Olho Direito */}
          <div
            className={`absolute top-6 right-3 w-3 ${
              isBlinking ? "h-[2px]" : "h-[12px]"
            } bg-white rounded-full transition-all duration-100`}
            style={{
              transform: `translate(${eyeShift.x}px, ${eyeShift.y}px)`,
              opacity: faceExpression === "thoughtful" ? 0.9 : 1,
            }}
          ></div>
          {/* Boca */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-150 bg-white"
            style={{
              width: isTalking || (isTyping && Math.random() > 0.5) ? "10px" : "12px",
              height: isTalking || (isTyping && Math.random() > 0.5) ? "3px" : "6px",
              borderRadius:
                faceExpression === "friendly"
                  ? "0 0 10px 10px"
                  : faceExpression === "thoughtful"
                  ? "100px / 50px"
                  : "100px",
              transform: `translateX(-50%) scale(${
                isTalking || (isTyping && Math.random() > 0.7) ? "0.9, 0.7" : "1, 1"
              })`,
              opacity: faceExpression === "thoughtful" ? 0.8 : 1,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AegisFaceAnimation;