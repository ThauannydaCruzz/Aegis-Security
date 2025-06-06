import React, { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Globe, Camera, Eye, EyeOff, UserPlus } from "lucide-react";
// import { AlertTriangle } from "lucide-react"; // Opcional: para ícone de erro na câmera
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// --- Validação do formulário com Zod ---
const registerSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  country: z.string().min(1, "País é obrigatório"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve concordar com os termos",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formError, setFormError] = useState("");
  const [isFaceCapture, setIsFaceCapture] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [pendingFormValues, setPendingFormValues] =
    useState<RegisterFormValues | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: "",
      agreeToTerms: false,
    },
  });

  // Função para cadastro SEM reconhecimento facial (chamada pelo botão específico)
  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setFormError("");
      const dataToSend = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
        country: values.country,
        agree_to_terms: values.agreeToTerms,
      };

      await axios.post("http://localhost:8000/auth/register", dataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao Aegis Security. Faça login para continuar.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao fazer cadastro:", error);
      const detail = error?.response?.data?.detail;
      setFormError(
        detail ||
          "Erro ao fazer cadastro. Verifique seus dados e tente novamente."
      );
      toast({
        title: "Erro ao fazer cadastro",
        description: detail || "Verifique seus dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para INICIAR a captura facial (após validação dos dados do formulário)
  const initFaceCapture = async (values: RegisterFormValues) => {
    setCameraError("");
    setCapturing(true); 
    setIsFaceCapture(true);
    setPendingFormValues(values); // Salva os dados do formulário validados
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            if(videoRef.current) {
                videoRef.current.play();
            }
        };
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
      setCapturing(false);
    }
  };

  // Função para parar a câmera e resetar estados da captura facial
  const stopCameraAndReset = () => {
    setCapturing(false);
    setIsFaceCapture(false);
    setPendingFormValues(null);
    setCameraError(""); 
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Função para capturar a imagem e enviar o formulário COM reconhecimento facial
  const captureAndSend = async () => {
    if (!videoRef.current || !pendingFormValues || !capturing) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        // Se o vídeo estiver espelhado via CSS (transform: scaleX(-1)),
        // e o backend espera uma imagem não espelhada, esta captura está correta.
        // Se o backend espera a imagem como o usuário vê (espelhada), precisaria espelhar o canvas aqui.
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const formData = new FormData();
        formData.append("first_name", pendingFormValues.firstName);
        formData.append("last_name", pendingFormValues.lastName);
        formData.append("email", pendingFormValues.email);
        formData.append("password", pendingFormValues.password);
        formData.append("country", pendingFormValues.country);
        formData.append(
          "agree_to_terms",
          String(pendingFormValues.agreeToTerms) // Backend espera string para booleano em FormData
        );
        formData.append("face_image", blob, "face.jpg");

        await axios.post("http://localhost:8000/auth/register-face", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast({
          title: "Cadastro facial realizado com sucesso!",
          description:
            "Bem-vindo ao Aegis Security. Faça login para continuar.",
        });
        stopCameraAndReset();
        navigate("/login");
      } catch (error: any) {
        const detail = error?.response?.data?.detail;
        toast({
          title: "Erro no cadastro facial",
          description: detail || error.message || "Erro desconhecido. Tente novamente.",
          variant: "destructive",
        });
        // Opcional: não parar a câmera para permitir nova tentativa, ou parar:
        // stopCameraAndReset(); 
      }
    }, "image/jpeg");
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Fundo com brilho roxo e estrelas */}
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
          />
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
        <h1 className="text-2xl font-medium text-white mb-2">Cadastro Aegis</h1>
        <p className="text-white/60 text-center mb-8 text-sm">
          Registre-se para ter seus dados protegidos pela tecnologia Aegis
          Security
        </p>
        {formError && !isFaceCapture && ( // Mostra erro do formulário apenas se não estiver na tela de captura facial
          <div className="w-full bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4">
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
        )}

        {isFaceCapture ? (
          <div className="w-full flex flex-col items-center transition-all duration-300 ease-in-out">
            <p className="text-white/80 text-center mb-4 text-lg font-medium">
              Captura Facial para Cadastro
            </p>
            <p className="text-white/60 text-center mb-6 text-sm">
              Posicione seu rosto dentro da marcação da câmera.
            </p>

            <div className="w-64 h-64 md:w-72 md:h-72 relative mb-8 rounded-2xl shadow-xl shadow-aegis-purple/25 overflow-hidden border-2 border-aegis-purple/60 bg-black/30">
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
              {/* Placeholder enquanto a câmera ativa ou se houver erro antes de carregar o srcObject */}
              {(!capturing || !videoRef.current?.srcObject) && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                  <Camera className="h-16 w-16 md:h-20 md:w-20 text-aegis-purple/70 animate-pulse mb-3" />
                  <p className="text-sm text-white/70 text-center">
                    Ativando câmera...
                  </p>
                </div>
              )}
              {/* Overlay de guia quando a câmera estiver ativa e sem erros */}
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
                <UserPlus size={20} className="mr-2" />
                Capturar e Cadastrar
              </Button>
              <Button
                onClick={stopCameraAndReset} // Chama a função que também limpa pendingFormValues e cameraError
                variant="outline"
                className="flex-1 border-white/40 text-white/90 hover:bg-white/10 hover:text-white h-12 rounded-md transition-colors duration-150 shadow-sm hover:shadow-md"
              >
                Cancelar
              </Button>
            </div>
            <p className="text-white/50 text-xs mt-8 text-center px-4">
              Sua imagem facial será usada para proteger sua conta e facilitar o login seguro.
            </p>
          </div>
        ) : (
          <>
            <Form {...registerForm}>
              {/* O onSubmit foi removido da tag <form> para controle individual dos botões */}
              <form className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Nome"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-md focus:border-aegis-purple/80 focus:ring-aegis-purple/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Sobrenome"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-md focus:border-aegis-purple/80 focus:ring-aegis-purple/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                <FormField
                  control={registerForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="País"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-md pl-10 focus:border-aegis-purple/80 focus:ring-aegis-purple/70" // pl-10 para dar espaço ao ícone à esquerda
                            {...field}
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
                            <Globe size={16} />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2.5 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-aegis-purple data-[state=checked]:border-aegis-purple border-white/30 h-5 w-5 rounded"
                          id="agreeToTerms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="agreeToTerms" className="text-sm text-white/70 font-normal cursor-pointer">
                          Eu concordo com os{" "}
                          <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-aegis-purple underline hover:text-aegis-purple/80">
                            Termos de Serviço
                          </a>{" "}
                          e{" "}
                          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-aegis-purple underline hover:text-aegis-purple/80">
                            Políticas de Privacidade
                          </a>
                        </FormLabel>
                        <FormMessage className="text-red-400" />
                      </div>
                    </FormItem>
                  )}
                />
                <Button
                  type="button" // Mudado para 'button'
                  onClick={registerForm.handleSubmit(handleRegister)} // Submissão via JS
                  className="w-full bg-gradient-to-r from-aegis-purple to-blue-500 text-white h-12 rounded-md hover:opacity-90 transition-opacity"
                  disabled={registerForm.formState.isSubmitting} // Desabilita durante o envio de qualquer um dos formulários
                >
                  {registerForm.formState.isSubmitting && !isFaceCapture ? "CADASTRANDO..." : "CADASTRAR SEM ROSTO"}
                </Button>
                <Button
                  type="button" // Mudado para 'button'
                  className="w-full bg-transparent border border-aegis-purple/60 text-white h-12 rounded-md hover:bg-aegis-purple/20 transition-colors flex items-center justify-center gap-2"
                  onClick={registerForm.handleSubmit(initFaceCapture)} // Valida o form antes de abrir a câmera
                  disabled={registerForm.formState.isSubmitting} // Desabilita durante o envio de qualquer um dos formulários
                >
                  <Camera size={18} />
                  CADASTRAR COM RECONHECIMENTO FACIAL
                </Button>
              </form>
            </Form>
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Já possui conta?{" "}
                <Button
                  onClick={() => navigate("/login")}
                  variant="link"
                  className="text-aegis-purple p-0 h-auto text-sm font-medium ml-1 hover:text-aegis-purple/80"
                >
                  Entre aqui
                </Button>
              </p>
            </div>
          </>
        )}
      </div>
      {/* CSS para animações e estilos de foco */}
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
        .focus\\:border-aegis-purple\\/80:focus {
            border-color: rgba(160, 32, 240, 0.8) !important; 
        }
        .focus\\:ring-aegis-purple\\/70:focus {
            --tw-ring-color: rgba(160, 32, 240, 0.7) !important; 
            box-shadow: 0 0 0 2px var(--tw-ring-color) !important;
        }
      `,
        }}
      />
    </div>
  );
};

export default Register;