import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logs from '@/logs_expanded.json';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  MapPin,
  Shield,
  Terminal,
  Clock,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SecurityEvent {
  id: number;
  date: string;
  time: string;
  event: string;
  device: string;
  location: string;
  ip: string;
  severity: 'high' | 'medium' | 'low';
}

const SecurityDetails = () => {
  const navigate = useNavigate();

  const [profile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: 'Usuário',
      role: 'Especialista em Segurança',
      avatar: ''
    };
  });

  const securityEvents: SecurityEvent[] = logs.map((log: any, index: number) => {
    const score = parseInt(log["Anomaly Score"]);
    let severity: 'low' | 'medium' | 'high' = 'low';

    if (score >= 12) severity = 'high';
    else if (score >= 7) severity = 'medium';

    return {
      id: index + 1,
      date: log["Data"],
      time: log["Hora"],
      event: log["Títulos do Ataque"][0],
      device: log["Método"],
      location: "Desconhecido",
      ip: log["IP Atacante"],
      severity
    };
  });

  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [isOpenSeverity, setIsOpenSeverity] = useState(false);

  const filteredEvents = selectedSeverity
    ? securityEvents.filter(event => event.severity === selectedSeverity)
    : securityEvents;

  const securityMetrics = [
    { label: 'Pontuação Geral', value: 78, maxValue: 100, color: 'bg-emerald-500' },
    { label: 'Força da Senha', value: 85, maxValue: 100, color: 'bg-aegis-teal' },
    { label: 'Autenticação', value: 75, maxValue: 100, color: 'bg-blue-500' },
    { label: 'Atividade de Login', value: 65, maxValue: 100, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-aegis-darker via-black to-aegis-dark text-white">
      <div className="container mx-auto px-4 py-8 text-white">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 text-white"
              onClick={() => navigate('/security-dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Detalhes de Segurança</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{profile.name}</p>
              <p className="text-xs text-white">{profile.role}</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-aegis-purple/50">
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.name} />
              ) : (
                <AvatarFallback className="bg-aegis-purple/30 text-white">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <Card className="mb-8 bg-gradient-to-br from-aegis-dark to-black border-aegis-purple/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
                <Shield className="h-5 w-5 text-white mr-2" />
                Visão Geral da Segurança
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {securityMetrics.map((metric, index) => (
                  <div key={index} className="bg-black/30 rounded-lg p-4">
                    <p className="text-sm text-white mb-2">{metric.label}</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-xs text-white">/{metric.maxValue}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.color}`} 
                        style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity" className="mb-8">
            <TabsList className="bg-gray-900/50 border border-gray-800 text-white">
              <TabsTrigger value="activity" className="data-[state=active]:bg-aegis-purple/20 text-white">
                <Activity className="h-4 w-4 mr-2" />
                Atividade
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-aegis-purple/20 text-white">
                <Shield className="h-4 w-4 mr-2" />
                Recomendações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card className="bg-gradient-to-br from-aegis-dark to-black border-aegis-purple/20">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-white">Histórico de Segurança</CardTitle>
                    <div className="flex space-x-2">
                      <Collapsible open={isOpenSeverity} onOpenChange={setIsOpenSeverity}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-black/20 border-gray-700 text-white">
                            <Filter className="h-4 w-4 mr-2" />
                            {selectedSeverity ? `Severidade: ${selectedSeverity}` : 'Filtrar'}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="absolute right-0 mt-2 w-48 z-10 bg-gray-900 border border-gray-800 rounded-md p-2 shadow-lg text-white">
                          <div className="space-y-1">
                            {['Todos', 'high', 'medium', 'low'].map(level => (
                              <Button
                                key={level}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left text-white"
                                onClick={() => setSelectedSeverity(level === 'Todos' ? null : level)}
                              >
                                {level !== 'Todos' && (
                                  <span className={`h-2 w-2 rounded-full mr-2 ${
                                    level === 'high' ? 'bg-red-500' :
                                    level === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                  }`} />
                                )}
                                {level === 'Todos' ? 'Todos' : `Severidade: ${level}`}
                              </Button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      <Button variant="outline" size="sm" className="bg-black/20 border-gray-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    {filteredEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex flex-col md:flex-row md:items-center p-3 bg-black/30 hover:bg-black/40 rounded-lg transition-colors border border-gray-800/50"
                      >
                        <div className="flex items-center mb-2 md:mb-0 md:mr-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            event.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            event.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {event.severity === 'high' ? <AlertCircle className="h-5 w-5" /> :
                             event.severity === 'medium' ? <Terminal className="h-5 w-5" /> :
                             <CheckCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{event.event}</p>
                            <div className="flex items-center text-xs text-white">
                              <Calendar className="h-3 w-3 mr-1" />{event.date}
                              <Clock className="h-3 w-3 ml-2 mr-1" />{event.time}
                            </div>
                          </div>
                        </div>
                        <div className="ml-0 md:ml-auto flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-800 rounded-full flex items-center text-white">
                            <Smartphone className="h-3 w-3 mr-1" />
                            {event.device}
                          </span>
                          <span className="px-2 py-1 bg-gray-800 rounded-full flex items-center text-white">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </span>
                          <span className="px-2 py-1 bg-gray-800 rounded-full text-white">IP: {event.ip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <Card className="bg-gradient-to-br from-aegis-dark to-black border-aegis-purple/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Recomendações de Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-white text-sm">
                    <p>Recomendações personalizadas com base nos tipos de ataques detectados serão exibidas aqui futuramente.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SecurityDetails;
