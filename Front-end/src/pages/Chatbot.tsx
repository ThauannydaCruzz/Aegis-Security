import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Info,
  Shield,
  Send,
  AlertTriangle,
  RefreshCcw,
  Download,
  LogOut, 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import ChatMessage from "@/components/ChatMessage";
import { useChat, MediaAttachment, Message as ChatMessageType } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext"; 
import MediaSelector from "@/components/MediaSelector"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

interface ChatApiResponse {
  resposta: string;
  context: Array<{role: string; content: string}>;
  end_conversation?: boolean;
}

interface FinalizeApiResponse {
    resposta: string;
    context: Array<{role: string; content: string}>;
    end_conversation: boolean;
}

const Chatbot: React.FC = () => {
  const { user, isLoading: authIsLoading, isAuthenticated } = useAuth();
  
  const [initialGreeting, setInitialGreeting] = useState<string>(""); 
  const [initialQuestion, setInitialQuestion] = useState<string>(""); 
  const [showAnimatedGreeting, setShowAnimatedGreeting] = useState<boolean>(false);
  const [backendGreetingLoaded, setBackendGreetingLoaded] = useState<boolean>(false);

  const [showOptions, setShowOptions] = useState<boolean>(false); 
  const [userInput, setUserInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false); 
  const [insightDialogOpen, setInsightDialogOpen] = useState<boolean>(false);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState<boolean>(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const { messages, addMessage, clearMessages } = useChat();
  const [chatContext, setChatContext] = useState<Array<{role: string; content: string}>>([]);
  const [conversationEnded, setConversationEnded] = useState<boolean>(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const downloadChatInsights = useCallback((finalContext: Array<{role: string; content: string}> | undefined, userName: string | undefined) => {
    if (!finalContext || finalContext.length === 0 || !userName) {
      toast({ title: "Sem Conteúdo", description: "Não há conversa ou nome de usuário para baixar.", variant: "destructive" });
      return;
    }
    let insightsText = `Resumo da Conversa com Aegis\n`;
    insightsText += `Usuário: ${userName}\n`;
    insightsText += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
    insightsText += `---------------------------------------------------\n\n`;
    const userVisibleContext = finalContext.filter(msg => msg.role === 'user' || msg.role === 'assistant');
    userVisibleContext.forEach(msg => {
      const roleLabel = msg.role === 'user' ? userName : 'Aegis';
      insightsText += `${roleLabel}:\n${msg.content}\n\n`;
    });
    insightsText += `---------------------------------------------------\nFim do resumo.\n`;
    const blob = new Blob([insightsText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `resumo_chat_aegis_${userName.replace(/\s+/g, '_')}_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Download Iniciado", description: "O resumo da conversa foi baixado.", variant: "success" });
  }, [toast]);

  const loadInitialMessage = useCallback(async (isNewConversation = false) => {
    if (!isAuthenticated || !user?.first_name) {
        console.log("loadInitialMessage: Usuário não autenticado ou sem nome. Retornando.");
        return;
    }

    if (isNewConversation) {
      console.log("loadInitialMessage: Iniciando NOVA conversa.");
      if (typeof clearMessages === 'function') clearMessages();
      setChatContext([]); 
      setConversationEnded(false);
      setBackendGreetingLoaded(false); 
      setShowAnimatedGreeting(false); 
      setShowOptions(false);
    } else if (backendGreetingLoaded && messages.length > 0) { 
      console.log("loadInitialMessage: Saudação inicial do backend já carregada e há mensagens. Retornando.");
      if(messages.length > 0) setShowOptions(true); 
      return;
    }

    setIsTyping(true);
    try {
      console.log("loadInitialMessage: Fetching /chat/ para saudação inicial.");
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.first_name, message: "", context: [] }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erro HTTP do backend ao carregar saudação:", response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      const data: ChatApiResponse = await response.json();
      
      if (isNewConversation && typeof clearMessages === 'function') {
        clearMessages();
      }
      addMessage(data.resposta, "bot"); 
      setChatContext(data.context);
      setShowOptions(true);
      inputRef.current?.focus();
      setBackendGreetingLoaded(true); 
    } catch (error) {
      console.error("Falha ao carregar mensagem inicial do backend:", error);
      let errorMessage = "Falha ao carregar saudação do Aegis.";
      if (error instanceof Error) { errorMessage = error.message; }
      toast({ title: "Erro de Conexão", description: errorMessage, variant: "destructive"});
      setBackendGreetingLoaded(true); 
    } finally {
      setIsTyping(false);
    }
  }, [isAuthenticated, user?.first_name, addMessage, clearMessages, backendGreetingLoaded, toast, messages.length]); // messages.length é ok aqui

  useEffect(() => {
    if (!authIsLoading && isAuthenticated && !backendGreetingLoaded && messages.length === 0 && !isTyping) {
      console.log("useEffect[auth, backendGreetingLoaded, messages.length]: Chamando loadInitialMessage");
      loadInitialMessage(false); 
    }
  }, [authIsLoading, isAuthenticated, backendGreetingLoaded, loadInitialMessage, messages.length, isTyping]);

  const handleSendMessage = async () => {
    if (conversationEnded) {
      toast({ title: "Conversa Encerrada", description: "Inicie uma nova conversa para continuar."});
      return;
    }
    if (!userInput.trim() && !selectedMedia) return;

    const messageToSend = userInput.trim();
    let mediaAttachmentData: MediaAttachment | undefined;
    addMessage(messageToSend, "user", mediaAttachmentData);
    const currentChatContext = chatContext; 
    setUserInput(""); setSelectedMedia(null); setIsTyping(true); setShowAnimatedGreeting(false); 

    try {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user?.first_name || "Usuário", message: messageToSend, context: currentChatContext }),
      });
      if (!response.ok) { const errorText = await response.text(); throw new Error(`Erro HTTP ${response.status}: ${errorText}`); }
      const data: ChatApiResponse = await response.json();
      addMessage(data.resposta, "bot"); setChatContext(data.context); 
      if (data.end_conversation) {
        setConversationEnded(true);
        toast({ title: "Atendimento Concluído", description: data.resposta || "O Aegis concluiu esta interação.", duration: 7000,
          action: ( <Button variant="outline" size="sm" onClick={() => downloadChatInsights(data.context, user?.first_name)}> <Download className="mr-2 h-4 w-4" /> Baixar Resumo </Button> ),
        });
      }
    } catch (error) {
      console.error("Falha ao enviar mensagem:", error);
      let errorMessage = "Não foi possível enviar a mensagem.";
      if (error instanceof Error) { errorMessage = error.message; }
      addMessage(`Desculpe, ocorreu um erro na comunicação. (${errorMessage.substring(0,100)})`, "error");
      toast({ title: "Erro de Comunicação", description: errorMessage, variant: "destructive"});
    } finally { setIsTyping(false); inputRef.current?.focus(); }
  };
  
  const confirmEmergencyAction = async (): Promise<void> => { 
    setEmergencyDialogOpen(false);
    addMessage("Acionando o protocolo de emergência...", "system"); 
    setIsTyping(true);
    try {
      const lastUserMessage = messages.filter(m => m.type === 'user').pop()?.text || "Nenhuma interação anterior registrada.";
      const response = await fetch(`${API_BASE_URL}/security/incident`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user?.first_name || "Usuário Anônimo", description: `Contato de emergência via chatbot por ${user?.first_name || "Usuário Anônimo"}. Última mensagem do usuário: ${lastUserMessage}`}),
      });
      if (!response.ok) { const errorText = await response.text(); throw new Error(`Erro HTTP ${response.status}: ${errorText}`);}
      const responseData = await response.json();
      addMessage("Alerta de emergência enviado à equipe Aegis. Eles devem entrar em contato em breve.", "bot");
      toast({ title: "Emergência Acionada", description: responseData.status || "Alerta enviado à equipe.", variant: "destructive"});
    } catch (error) {
      let errorMessage = "Não foi possível enviar o alerta.";
      if (error instanceof Error) {errorMessage = error.message;}
      console.error("Falha ao acionar emergência:", error);
      addMessage(`Falha ao enviar o alerta de emergência. (${errorMessage.substring(0,100)})`, "error");
      toast({ title: "Erro na Emergência", description: errorMessage, variant: "destructive"});
    } finally { setIsTyping(false); }
  };

  const handleFinalizeConversation = async (): Promise<void> => {
    if (conversationEnded) { toast({ title: "Conversa já finalizada."}); return; }
    if (!messages.length) { toast({ title: "Ação não disponível", description: "Não há conversa ativa para finalizar."}); return; }
    addMessage("Solicitando finalização do atendimento e geração de relatório...", "system-finalize", undefined, true);
    setIsTyping(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat/finalize/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user?.first_name || "Usuário", context: chatContext }),
      });
      if (!response.ok) { const errorText = await response.text(); throw new Error(`Erro HTTP ${response.status} ao finalizar: ${errorText}`);}
      const data: FinalizeApiResponse = await response.json();
      addMessage(data.resposta, "bot"); setChatContext(data.context); 
      if (data.end_conversation) {
        setConversationEnded(true);
        toast({ title: "Atendimento Finalizado", description: data.resposta || "O relatório da conversa foi gerado.", duration: 7000,
          action: ( <Button variant="outline" size="sm" onClick={() => downloadChatInsights(data.context, user?.first_name)}> <Download className="mr-2 h-4 w-4" /> Baixar Cópia </Button> ),
        });
      }
    } catch (error) {
      let errorMessage = "Não foi possível finalizar e gerar o relatório.";
      if (error instanceof Error) {errorMessage = error.message;}
      console.error("Falha ao finalizar conversa:", error);
      addMessage(`Erro ao finalizar. (${errorMessage.substring(0,100)})`, "error");
      toast({ title: "Erro ao Finalizar", description: errorMessage, variant: "destructive"});
    } finally { setIsTyping(false); }
  };

  const handleNewConversationClick = () => {
    setBackendGreetingLoaded(false); 
    loadInitialMessage(true); 
  };

  const handleFileSelect = (file: File) => { setSelectedMedia(file); setMediaSelectorOpen(false); toast({ title: "Arquivo selecionado", description: `${file.name}` }); inputRef.current?.focus(); };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !isTyping && !conversationEnded) { handleSendMessage(); }};
  const handleSpecialAction = (type: "insight" | "tip") => { if (type === "insight") { setInsightDialogOpen(true); } else if (type === "tip") { navigate("/aegis-team"); }};
  const openMediaSelector = () => { if (conversationEnded) { toast({ title: "Conversa Encerrada"}); return; } setMediaSelectorOpen(true); };

  if (authIsLoading) {
    return <div className="min-h-screen w-full bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex flex-col items-center justify-center text-white">Carregando Aegis...</div>;
  }

  // O JSX principal do return começa aqui
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex flex-col relative overflow-hidden">
      {mediaSelectorOpen && (<MediaSelector onSelect={handleFileSelect} onClose={() => setMediaSelectorOpen(false)} /> )}
      
      <AlertDialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-aegis-purple/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Acesso aos Insights</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Você gostaria de acessar seus insights de segurança e o painel de controle?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">Não</AlertDialogCancel>
            <AlertDialogAction className="bg-aegis-purple hover:bg-purple-700 text-white" onClick={() => navigate("/security-dashboard")}>
              Sim, ir para o Painel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-red-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Contato de Emergência
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta opção deve ser usada apenas em situações críticas. A equipe Aegis será notificada. Deseja prosseguir?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmEmergencyAction}>
              Contatar Equipe Aegis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-aegis-purple/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-aegis-purple/10 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2 sm:gap-3 z-20">
        {!conversationEnded && messages.length > 0 && (
            <Button variant="outline" size="icon" onClick={handleFinalizeConversation} title="Finalizar Atendimento e Gerar Relatório"
                className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-600/30 backdrop-blur-md text-yellow-500 w-9 h-9 sm:w-10 sm:h-10 rounded-full">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
        )}
        {(messages.length > 0 || conversationEnded) && (
          <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-aegis-purple/20 backdrop-blur-md text-aegis-purple w-9 h-9 sm:w-10 sm:h-10 rounded-full" onClick={handleNewConversationClick} title="Nova Conversa">
            <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        )}
        <div className="w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center"> <Shield className="w-4 h-4 text-aegis-purple" /> </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 z-10 max-w-2xl mx-auto w-full"> 
        <div className="w-full mt-10 sm:mt-12 text-center mb-4">
          {messages.length === 0 && showAnimatedGreeting && !backendGreetingLoaded && (
            <>
              <h1 className="text-xl sm:text-2xl font-medium text-white">{initialGreeting}</h1>
              <p className="text-aegis-purple/70 mt-1 text-sm sm:text-base">Aegis Security ao seu dispor</p>
            </>
          )}
        </div>

        <div className="w-full flex-1 mb-4 overflow-hidden">
          {messages.length === 0 && showAnimatedGreeting && !backendGreetingLoaded ? ( 
             <div className="h-full flex items-center justify-center text-center">
               <h2 className="text-2xl sm:text-3xl font-bold text-white">
                 {initialQuestion}
                 <span className={`inline-block w-2 h-5 bg-white ml-1 animate-[blink_1s_step-end_infinite]`}></span>
               </h2>
             </div>
          ) : messages.length === 0 && !isTyping && !backendGreetingLoaded && !showAnimatedGreeting ? ( 
             <div className="h-full flex items-center justify-center text-center"> <p className="text-lg sm:text-xl text-gray-400">Conectando ao Aegis...</p> </div>
          ) : (
            <ScrollArea ref={chatAreaRef} className="h-full max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] pr-2 sm:pr-4">
              <div className="flex flex-col space-y-4 pb-4">
                {messages.map((msg: ChatMessageType) => ( <ChatMessage key={msg.id} message={msg.text} type={msg.type} timestamp={msg.timestamp} media={msg.media} /> ))}
                {isTyping && (
                  <div className="flex items-center space-x-2 self-start pl-3">
                    <div className="w-10 h-10 bg-aegis-dark rounded-full flex items-center justify-center"> <Shield className="w-5 h-5 text-aegis-purple opacity-70" /> </div>
                    <div className="flex items-center space-x-1 p-3 bg-aegis-dark rounded-lg">
                      {[0, 0.2, 0.4].map(delay => ( <div key={String(delay)} className="w-2 h-2 rounded-full bg-aegis-purple/70 animate-pulse" style={{ animationDelay: `${delay}s` }}></div> ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className={`w-full space-y-3 sm:space-y-4 transition-all duration-500 ${ (showOptions || (messages.length === 0 && backendGreetingLoaded)) && !authIsLoading ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
          {!conversationEnded && (
            <>
              {messages.length === 0 && !isTyping && (showAnimatedGreeting || backendGreetingLoaded) && (
                <div className="text-center">
                  <button className="bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto backdrop-blur-md" onClick={openMediaSelector}>
                    <PlusCircle className="w-6 h-6 text-aegis-purple" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button variant="outline" className="bg-aegis-purple/10 hover:bg-aegis-purple/20 border-aegis-purple/20 backdrop-blur-md h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl text-center" onClick={() => handleSpecialAction("insight")}>
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-aegis-purple mb-1 sm:mb-2" />
                  <span className="text-white text-xs sm:text-sm">Insights</span>
                </Button>
                <Button variant="outline" className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 backdrop-blur-md h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl text-center" onClick={() => setEmergencyDialogOpen(true)}>
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mb-1 sm:mb-2" />
                  <span className="text-white text-xs sm:text-sm">Emergência</span>
                </Button>
                <Button variant="outline" className="bg-aegis-purple/10 hover:bg-aegis-purple/20 border-aegis-purple/20 backdrop-blur-md h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl text-center" onClick={() => handleSpecialAction("tip")}>
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-aegis-purple mb-1 sm:mb-2" />
                  <span className="text-white text-xs sm:text-sm">Dicas</span>
                </Button>
              </div>
              <div className="relative w-full">
                <Input ref={inputRef} type="text" placeholder="Digite sua mensagem..."
                  className="w-full bg-aegis-purple/10 hover:bg-aegis-purple/20 border-aegis-purple/20 backdrop-blur-md h-12 sm:h-14 rounded-full pr-12 sm:pr-14 pl-11 sm:pl-12 text-white placeholder:text-white/50 text-sm sm:text-base"
                  value={userInput} onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress} disabled={isTyping || conversationEnded} />
                {selectedMedia && ( 
                    <div className="absolute left-3 -top-7 bg-aegis-purple/40 text-white text-xs py-1 px-2 rounded-md shadow-lg">
                        {selectedMedia.name.length > 15 ? selectedMedia.name.substring(0, 12) + "..." : selectedMedia.name}
                        <button className="ml-1.5 text-white/70 hover:text-white" onClick={() => setSelectedMedia(null)}>&times;</button>
                    </div>
                )}
                <Button variant="ghost" size="icon" className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-aegis-purple/20" onClick={openMediaSelector} disabled={isTyping || conversationEnded}> <PlusCircle className="w-5 h-5 text-aegis-purple" /> </Button>
                <Button variant="ghost" size="icon" className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full ${isTyping || conversationEnded || (!userInput.trim() && !selectedMedia) ? "bg-gray-600/50 cursor-not-allowed" : "bg-gradient-to-br from-aegis-purple to-purple-500 hover:opacity-90"}`} onClick={handleSendMessage} disabled={isTyping || conversationEnded || (!userInput.trim() && !selectedMedia)}> <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> </Button>
              </div>
            </>
          )}
          {conversationEnded && (
            <Button onClick={handleNewConversationClick} className="w-full bg-aegis-purple hover:bg-purple-700 text-white h-12 sm:h-14 rounded-full text-sm sm:text-base">
              <RefreshCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Iniciar Nova Conversa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Chatbot;