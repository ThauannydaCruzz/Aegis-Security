import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  ArrowLeft,
  PieChart,
  BarChart3,
  Bell,
  Lock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";

import logs from "@/logs_expanded.json"; // ajuste se necessário

const SecurityDashboard = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isLoading: authIsLoading, isAuthenticated } = useAuth();

  const [averageScore, setAverageScore] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const [resolvedPercent, setResolvedPercent] = useState(0);
  const [activityData, setActivityData] = useState<number[]>([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!logs.length) return;

    const scores = logs.map((l) => parseInt(l["Anomaly Score"]));
    const total = scores.reduce((a, b) => a + b, 0);
    setAverageScore(Math.round(total / scores.length));

    const resolvedCount = scores.filter((s) => s < 8).length;
    setResolvedPercent(Math.round((resolvedCount / logs.length) * 100));

    const recent = logs.slice(0, 3).map((log) => ({
      date: log.Data.split("/")[0] + "/" + log.Data.split("/")[1],
      text: log["Títulos do Ataque"]?.[0] || "Incidente Detectado",
      level: parseInt(log["Anomaly Score"]) >= 12 ? "high" : parseInt(log["Anomaly Score"]) >= 7 ? "medium" : "low",
    }));
    setIncidents(recent);

    const dias = Array(7).fill(0);
    logs.forEach((l) => {
      const [d, m, y] = l.Data.split("/");
      const date = new Date(`${y}-${m}-${d}`);
      dias[date.getDay()]++;
    });
    setActivityData(dias);

    const counter = {};
    logs.flatMap((l) => l["Títulos do Ataque"]).forEach((t) => {
      counter[t] = (counter[t] || 0) + 1;
    });

    const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 3);
    setRecommendations(
      sorted.map(([title]) => ({
        title,
        desc: "Recomendamos atenção a esse tipo de vulnerabilidade.",
      }))
    );
  }, []);

  if (authIsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex items-center justify-center text-white">
        Carregando Dashboard de Segurança...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex items-center justify-center text-white">
        Acesso negado. Por favor, faça login para continuar.
        <Button onClick={() => navigate("/login")} className="ml-4">Login</Button>
      </div>
    );
  }

  const displayName = user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Usuário";
  const displayRole = user.role || user.email;
  const displayAvatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-aegis-darker via-black to-aegis-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 text-white hover:bg-white/10"
              onClick={() => navigate("/chatbot")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>
              Security Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => navigate("/profile-edit")}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-white">{displayRole}</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-aegis-purple/50">
              <AvatarFallback className="bg-aegis-purple/30 text-white">
                {displayAvatarFallback}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold mb-2 text-white`}>
            Meu Dashboard
          </h1>
          <p className="text-white mb-8">
            Visão geral da sua segurança digital
          </p>

          {/* SCORE DE SEGURANÇA */}
          <Card className="mb-8 bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border-emerald-500/20">
            <CardContent className={`${isMobile ? "p-4" : "p-6"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-grey mb-1`}>
                    Score de Segurança
                  </h2>
                  <p className="text-grey text-sm">Baseado em {logs.length} eventos</p>
                </div>
                <div className={`${isMobile ? "text-4xl" : "text-5xl"} font-bold text-green`}>
                  {averageScore}
                  <span className={`${isMobile ? "text-xl" : "text-2xl"} text-emerald-400`}>
                    /100
                  </span>
                </div>
              </div>
              <div className="mt-6 w-full h-3 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: `${averageScore}%` }}
                ></div>
              </div>
              <div className="mt-4 grid grid-cols-1">
                <Button
                  variant="outline"
                  className="bg-black/10 border-white/10 text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300"
                  onClick={() => navigate("/security-details")}
                >
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* INCIDENTES DE SEGURANÇA */}
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader className="flex justify-between p-4 pb-2">
              <CardTitle className="font-medium text-white">Incidentes de Segurança Recentes</CardTitle>
              <Bell className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-white">
              {incidents.map((incident, index) => (
                <div key={index} className="flex items-center p-2 bg-black/20 rounded-lg">
                  <div className={`min-w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    incident.level === "high" ? "bg-red-500/20 text-red-500" :
                    incident.level === "medium" ? "bg-orange-500/20 text-orange-500" :
                    "bg-green-500/20 text-green-500"
                  }`}>
                    <span className="text-xs font-medium">{incident.date}</span>
                  </div>
                  <span className={`${isMobile ? "text-xs" : "text-sm"} text-white`}>
                    {incident.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ATIVIDADE DE SEGURANÇA */}
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader className="flex justify-between p-4 pb-2">
              <CardTitle className="font-medium text-white">Atividade de Segurança</CardTitle>
              <BarChart3 className="h-5 w-5 text-aegis-teal" />
            </CardHeader>
            <CardContent className="p-4 text-white">
              <div className="flex h-40 items-end space-x-2">
                {activityData.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gradient-to-t from-aegis-purple to-aegis-teal rounded-t-sm" style={{ height: `${value * 6}px` }}></div>
                    <span className="text-xs mt-1">{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs">
                <span className="text-white">Atividade semanal</span>
                <span className="text-white">{logs.length} eventos totais</span>
              </div>
            </CardContent>
          </Card>

          {/* RECOMENDAÇÕES */}
          <div className="mb-8">
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-4 text-white`}>
              Recomendações de Segurança
            </h2>
            <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-3"} gap-4`}>
              {recommendations.map((rec, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-4 text-white">
                    <h3 className="font-medium text-white">{rec.title}</h3>
                    <p className="text-sm text-white mt-1">{rec.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SecurityDashboard;
