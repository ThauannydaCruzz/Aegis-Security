import React, { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FingerprintIcon, Eye, EyeOff } from "lucide-react"; // Eye e EyeOff adicionados
// import { AlertTriangle } from "lucide-react"; // Opcional: para ícone de erro na câmera
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext"; // Ajuste o caminho se necessário

// Login schema
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFaceRecognition, setIsFaceRecognition] = useState(false);
  const [formError, setFormError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para visibilidade da senha

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setFormError("");
      const response = await axios.post("http://localhost:8000/auth/login", {
        email: values.email,
        password: values.password,
      });
      const data = response.data;
      await login(data.access_token);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao Aegis Security.",
      });
      navigate("/welcome");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setFormError("Erro ao fazer login. Verifique suas credenciais.");
      toast({
        title: "Erro ao fazer login",
        description:
          error?.response?.data?.detail || error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const openCamera = async () => {
    setCameraError("");
    setCapturing(true); // Inicialmente true para mostrar o estado de "ativando"
    // setIsFaceRecognition(true); // Já é true quando esta função é chamada
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            // setCapturing(true); // Movido para antes para o placeholder "ativando" funcionar
          }
        };
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
      setCapturing(false);
      // setIsFaceRecognition(false); // Manter na tela de reconhecimento facial para mostrar o erro
    }
  };

  const stopCamera = () => {
    // setIsFaceRecognition(false); // Será controlado pelo botão Cancelar ou sucesso
    setCapturing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleFaceRecognition = async () => {
    setIsFaceRecognition(true);
    await openCamera();
  };

  const captureAndSend = async () => {
    if (!videoRef.current || !capturing) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        // Se o vídeo estiver espelhado via CSS (transform: scaleX(-1)),
        // precisamos desenhar no canvas de forma espelhada também para que a imagem capturada corresponda ao que o backend espera.
        // Se o backend espera uma imagem não espelhada, e o CSS espelha, então o backend deve lidar com isso ou a imagem deve ser desespelhada aqui.
        // Para este exemplo, vamos assumir que o backend espera a imagem como ela é capturada pela câmera (não espelhada).
        // Se o CSS espelha para o usuário, a imagem capturada aqui não será espelhada por padrão.
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const formData = new FormData();
        formData.append("face_image", blob, "face.jpg");
        const response = await axios.post(
          "http://localhost:8000/auth/login-face",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const data = response.data;
        await login(data.access_token);
        toast({
          title: "Login facial bem-sucedido",
          description: "Bem-vindo ao Aegis Security.",
        });
        stopCamera();
        setIsFaceRecognition(false);
        navigate("/welcome");
      } catch (error: any) {
        toast({
          title: "Falha no reconhecimento facial",
          description:
            error?.response?.data?.detail ||
            error.message ||
            "Rosto não reconhecido ou erro no servidor.",
          variant: "destructive",
        });
        // Não pararemos a câmera aqui automaticamente, para permitir nova tentativa,
        // a menos que o erro seja irrecuperável.
        // stopCamera(); // Considerar se deve parar ou não em caso de erro
      }
    }, "image/jpeg");
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-full h-32 bg-aegis-purple/30 blur-[100px] transform -translate-y-1/2"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          ></div>
        ))}
        <div className="absolute top-[15%] right-[10%] text-white/20 transform rotate-12 animate-float">
          <ShieldCheck size={24} />
        </div>
        <div
          className="absolute bottom-[20%] left-[15%] text-white/20 transform -rotate-12 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <ShieldCheck size={32} />
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center backdrop-blur-lg bg-black/30 p-8 rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(160,32,240,0.3)] z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-aegis-purple rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-medium text-white mb-2">Login Aegis</h1>
        <p className="text-white/60 text-center mb-8 text-sm">
          Entre na sua conta para proteger seus dados com o Aegis Security
        </p>
        {formError && !isFaceRecognition && ( // Mostrar erro do formulário apenas se não estiver na tela de reconhecimento facial
          <div className="w-full bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4">
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
        )}

        {isFaceRecognition ? (
          <div className="w-full flex flex-col items-center transition-all duration-300 ease-in-out">
            <p className="text-white/80 text-center mb-4 text-lg font-medium">
              Reconhecimento Facial
            </p>
            <p className="text-white/60 text-center mb-6 text-sm">
              Posicione seu rosto dentro da marcação da câmera.
            </p>

            <div className="w-64 h-64 md:w-72 md:h-72 relative mb-8 rounded-2xl shadow-xl shadow-aegis-purple/25 overflow-hidden border-2 border-aegis-purple/60 bg-black/30">
              {/* Elemento de Vídeo */}
              <video
                ref={videoRef}
                width={288} // Corresponde a md:w-72
                height={288} // Corresponde a md:h-72
                className={`rounded-xl transition-opacity duration-500 ease-in-out w-full h-full ${
                  capturing && videoRef.current?.srcObject ? "opacity-100" : "opacity-0" // Garante que o srcObject está pronto
                }`}
                autoPlay
                muted
                playsInline
                style={{
                  objectFit: "cover",
                  transform: "scaleX(-1)", // Espelha o vídeo para uma experiência mais natural
                }}
              />

              {/* Overlay/Placeholder - visível quando o vídeo não está capturando ou como uma dica de fundo */}
              {(!capturing || !videoRef.current?.srcObject) && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                  <FingerprintIcon className="h-16 w-16 md:h-20 md:w-20 text-aegis-purple/70 animate-pulse mb-3" />
                  <p className="text-sm text-white/70 text-center">
                    Ativando câmera...
                  </p>
                </div>
              )}

              {/* Overlay para quando a câmera estiver ativa (opcional, para guiar o usuário) */}
              {capturing && videoRef.current?.srcObject && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[75%] h-[75%] border-2 border-white/30 border-dashed rounded-full animate-pulse opacity-75"></div>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="w-full max-w-xs bg-red-700/30 border border-red-600/50 rounded-lg p-3.5 mb-6 flex items-center justify-center gap-2.5 shadow-md">
                {/* <AlertTriangle className="h-5 w-5 text-red-400" /> Opcional */}
                <p className="text-red-300 text-sm font-medium text-center">{cameraError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-sm">
              <Button
                onClick={captureAndSend}
                className="flex-1 bg-gradient-to-r from-aegis-purple to-blue-500 text-white h-12 rounded-md hover:opacity-95 transition-opacity duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={!capturing || !videoRef.current?.srcObject || !!cameraError}
              >
                <ShieldCheck size={20} className="mr-2" />
                Autenticar Rosto
              </Button>
              <Button
                onClick={() => {
                  stopCamera();
                  setIsFaceRecognition(false);
                  setCameraError(""); // Limpa o erro da câmera ao cancelar
                }}
                variant="outline"
                className="flex-1 border-white/40 text-white/90 hover:bg-white/10 hover:text-white h-12 rounded-md transition-colors duration-150 shadow-sm hover:shadow-md"
              >
                Cancelar
              </Button>
            </div>
            <p className="text-white/50 text-xs mt-8 text-center px-4">
              Sua imagem facial é processada localmente para autenticação e não é armazenada permanentemente.
            </p>
          </div>
        ) : (
          <>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="w-full space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          className="bg-white/5 border-white/10 text-white h-12 rounded-md focus:border-aegis-purple/80 focus:ring-aegis-purple/70"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Senha"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-md pr-10 focus:border-aegis-purple/80 focus:ring-aegis-purple/70"
                            {...field}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-aegis-purple to-blue-500 text-white h-12 rounded-md hover:opacity-90 transition-opacity"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? "ENTRANDO..." : "ENTRAR"}
                </Button>
                <Button
                  type="button"
                  onClick={handleFaceRecognition}
                  className="w-full bg-transparent border border-aegis-purple/60 text-white h-12 rounded-md hover:bg-aegis-purple/20 transition-colors flex items-center justify-center gap-2"
                >
                  <FingerprintIcon size={18} />
                  ENTRAR COM RECONHECIMENTO FACIAL
                </Button>
              </form>
            </Form>
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Não possui conta?
                <Button
                  onClick={() => navigate("/register")}
                  variant="link"
                  className="text-aegis-purple p-0 h-auto text-sm font-medium ml-1 hover:text-aegis-purple/80"
                >
                  Cadastre-se
                </Button>
              </p>
            </div>
          </>
        )}
      </div>
      {/* CSS para animações personalizadas */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(12deg); }
          100% { transform: translateY(0px) rotate(12deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        /* Adicionar um foco mais visível para inputs, se necessário */
        .focus\\:border-aegis-purple\\/80:focus {
            border-color: rgba(160, 32, 240, 0.8); /* Cor aegis-purple com 80% de opacidade */
        }
        .focus\\:ring-aegis-purple\\/70:focus {
            --tw-ring-color: rgba(160, 32, 240, 0.7); /* Cor aegis-purple com 70% de opacidade para o anel */
            box-shadow: 0 0 0 2px var(--tw-ring-color);
        }
      `,
        }}
      />
    </div>
  );
};

export default Login;