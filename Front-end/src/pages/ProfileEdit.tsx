// src/pages/ProfileEdit.tsx (MODIFICADO E MELHORADO)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importações para o Select
import { Edit, Link as LinkIcon, Phone, Mail, ArrowLeft } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { User as AuthUser } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const profileSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório."),
  last_name: z.string().optional().or(z.literal("")),
  role: z.string().min(1, "Cargo é obrigatório."), // Agora pode ser uma das opções fixas
  location: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .url("URL inválida. Ex: https://meusite.com")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido.").min(1, "Email é obrigatório."),
  avatar: z.string().optional().or(z.literal("")),
  skills: z.array(z.string()).optional(),
});

type UserProfileFormValues = z.infer<typeof profileSchema>;

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user,
    isLoading: authIsLoading,
    isAuthenticated,
    token,
    updateUserContext,
  } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control, // Adicionado para uso com o Controller
    formState: { errors, isSubmitting: formIsSubmitting },
    reset,
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      location: "",
      role: "Membro Aegis", // Valor padrão para o cargo
      avatar: "",
      website: "",
      phone: "",
      skills: ["Segurança Digital"],
    },
  });

  const [newSkill, setNewSkill] = useState("");

  const watchedAvatar = watch("avatar");
  const watchedFirstName = watch("first_name");
  const watchedSkills = watch("skills", []);

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        location: user.country || "",
        role: user.role || "Membro Aegis", // Garante que o cargo do usuário seja carregado
        avatar: user.avatar || "",
        website: user.website || "",
        phone: user.phone || "",
        skills: user.skills || ["Segurança Digital"],
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserProfileFormValues) => {
    if (!token) {
      toast({
        title: "Erro de Autenticação",
        description: "Sessão inválida ou expirada. Por favor, faça login novamente.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const updatePayload = {
      first_name: data.first_name,
      last_name: data.last_name,
      country: data.location,
      role: data.role,
      website: data.website,
      phone: data.phone,
      skills: data.skills,
      avatar: data.avatar,
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/users/me/`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUserDataFromServer = response.data as AuthUser;
      updateUserContext(updatedUserDataFromServer);

      toast({
        title: "Perfil Atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        (error?.response?.data && typeof error.response.data === 'object'
          ? Object.values(error.response.data).flat().join(' ')
          : null) ||
        "Não foi possível salvar as alterações. Tente novamente.";
      toast({
        title: "Erro ao Atualizar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "O tamanho máximo para o avatar é 5MB.", variant: "destructive" });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({ title: "Tipo de arquivo inválido", description: "Por favor, selecione uma imagem (JPEG, PNG, WEBP, GIF).", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setValue("avatar", result, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleAddSkill = (e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e && 'key' in e && e.key !== "Enter") {
        return;
    }
    if (e) e.preventDefault();

    const skillToAdd = newSkill.trim();
    if (skillToAdd) {
      const currentSkills = watchedSkills || [];
      if (!currentSkills.includes(skillToAdd)) {
        setValue("skills", [...currentSkills, skillToAdd], { shouldValidate: true, shouldDirty: true });
        setNewSkill("");
      } else {
        toast({ description: `Competência "${skillToAdd}" já adicionada.`, variant: "default" });
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = watchedSkills || [];
    setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  if (authIsLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex items-center justify-center text-white">
        Carregando seu perfil...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
     return (
      <div className="min-h-screen w-full bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex items-center justify-center text-white">
        Acesso negado.{" "}
        <Button onClick={() => navigate("/login")} className="ml-2">
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-aegis-darker via-black to-aegis-dark flex flex-col items-center p-6 text-white">
      <div className="w-full max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 hover:bg-white/10 text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <div className="relative overflow-hidden w-full h-48 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-t-xl">
          <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="bg-aegis-dark border border-aegis-purple/20 rounded-b-xl p-6 md:p-8 relative">
          <div className="absolute -top-16 left-6 md:left-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 ring-4 ring-aegis-dark">
                {watchedAvatar ? (
                  <AvatarImage src={watchedAvatar} alt={watchedFirstName || "Avatar do usuário"} />
                ) : (
                  <AvatarFallback className="bg-aegis-purple/30 text-white text-4xl">
                    {watchedFirstName
                      ? watchedFirstName.charAt(0).toUpperCase()
                      : user?.first_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                <Edit className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={formIsSubmitting}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="pt-20 md:pt-24">
            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    className="bg-aegis-purple/10 border-aegis-purple/20 focus-visible:ring-aegis-purple"
                    disabled={formIsSubmitting}
                  />
                  {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    className="bg-aegis-purple/10 border-aegis-purple/20 focus-visible:ring-aegis-purple"
                    disabled={formIsSubmitting}
                  />
                  {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="role">Função / Cargo</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formIsSubmitting}
                      >
                        <SelectTrigger
                          id="role"
                          className="bg-aegis-purple/10 border-aegis-purple/20 focus-visible:ring-aegis-purple text-white"
                        >
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent className="bg-aegis-dark border-aegis-purple/50 text-white">
                          <SelectItem
                            value="Membro Aegis"
                            className="cursor-pointer hover:!bg-aegis-purple/30 focus:!bg-aegis-purple/40"
                          >
                            Membro Aegis
                          </SelectItem>
                          <SelectItem
                            value="Usuário Aegis"
                            className="cursor-pointer hover:!bg-aegis-purple/30 focus:!bg-aegis-purple/40"
                          >
                            Usuário Aegis
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">Localização (País)</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    className="bg-aegis-purple/10 border-aegis-purple/20 focus-visible:ring-aegis-purple"
                    disabled={formIsSubmitting}
                  />
                  {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-aegis-purple/50 h-4 w-4" />
                    <Input
                      id="website"
                      {...register("website")}
                      className="bg-aegis-purple/10 border-aegis-purple/20 pl-10 focus-visible:ring-aegis-purple"
                      placeholder="https://seusite.com"
                      disabled={formIsSubmitting}
                    />
                  </div>
                  {errors.website && <p className="text-red-400 text-xs mt-1">{errors.website.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-aegis-purple/50 h-4 w-4" />
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="bg-aegis-purple/10 border-aegis-purple/20 pl-10 focus-visible:ring-aegis-purple"
                      placeholder="+55 (00) 00000-0000"
                      disabled={formIsSubmitting}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-aegis-purple/5 border-aegis-purple/10 text-white/70 cursor-not-allowed"
                readOnly
                disabled
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="mt-6">
              <Label htmlFor="skills-input">Competências</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(watchedSkills || []).map((skill, index) => (
                  <div
                    key={index}
                    className="bg-aegis-purple/20 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-white/70 hover:text-white disabled:opacity-50"
                      aria-label={`Remover ${skill}`}
                      disabled={formIsSubmitting}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="skills-input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Adicionar competência..."
                  className="bg-aegis-purple/10 border-aegis-purple/20 focus-visible:ring-aegis-purple flex-grow"
                  disabled={formIsSubmitting}
                />
                <Button
                    type="button"
                    variant="secondary" // Alterado para melhor contraste
                    size="sm"
                    onClick={handleAddSkill}
                    disabled={formIsSubmitting || !newSkill.trim()}
                    className="bg-aegis-purple/30 hover:bg-aegis-purple/40 text-white focus-visible:ring-aegis-purple"
                >
                    Adicionar
                </Button>
              </div>
              <p className="text-white/50 text-xs mt-1">
                Pressione Enter ou clique em Adicionar.
              </p>
              {errors.skills && <p className="text-red-400 text-xs mt-1">{errors.skills.message}</p>}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                className="bg-aegis-purple hover:bg-purple-700 text-white px-6 py-2"
                disabled={formIsSubmitting}
              >
                {formIsSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;