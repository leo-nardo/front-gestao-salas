"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { useAuthLoginService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { getRoleRedirectPath } from "@/services/auth/role-redirect";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import { toast } from "sonner";
import Link from "@/components/link";

const schema = yup.object().shape({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

function LoginPageContent() {
  const router = useRouter();
  const params = useParams();
  const language = params.language as string;
  const authLoginService = useAuthLoginService();
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { data: responseData, status } = await authLoginService({
        email: data.email,
        password: data.password,
      });

      if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        toast.error("E-mail ou senha incorretos");
        return;
      }

      if (status !== HTTP_CODES_ENUM.OK) {
        toast.error("Não foi possível entrar. Tente novamente.");
        return;
      }

      setTokensInfo({
        token: responseData.token,
        refreshToken: responseData.refreshToken,
        tokenExpires: responseData.tokenExpires,
      });
      setUser(responseData.user);

      toast.success("Login realizado com sucesso");

      const redirectPath = getRoleRedirectPath(
        (responseData.user.role?.id as number) || 0,
        language
      );
      router.push(redirectPath);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-gradient-to-br from-primary to-[#123c6e] p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
        <div className="absolute right-10 bottom-20 w-64 h-64 rounded-full bg-white opacity-5 mix-blend-overlay"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary font-bold text-xl">
              A
            </div>
            <span className="font-mono text-xs tracking-[0.2em] text-sidebar-foreground uppercase">
              GESTÃO DE ESPAÇOS ACADÊMICOS
            </span>
          </div>

          <div className="max-w-xl">
            <h1 className="mb-6 font-sans text-[40px] font-extrabold leading-tight text-white">
              Todo o campus, uma grade só.
            </h1>
            <p className="text-sidebar-foreground text-lg leading-relaxed max-w-md">
              Ensalamento, reservas, equipamentos e limpeza no mesmo lugar — sem
              planilha solta, sem conflito escondido.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sidebar-foreground text-sm">
          © {new Date().getFullYear()} Gestão de Espaços Acadêmicos.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-12">
        {/* Mobile simplified header when hero is hidden */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
            A
          </div>
          <span className="font-mono text-[10px] tracking-wider text-primary font-bold">
            GEA
          </span>
        </div>

        <Card className="w-full max-w-md p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white font-bold">
                H
              </div>
              <span className="font-semibold text-foreground">
                Faculdade Horizonte
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Entrar</h2>
            <p className="text-muted-foreground text-sm">
              Acesse com suas credenciais institucionais.
            </p>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@instituicao.edu.br"
                  className="h-11"
                  {...methods.register("email")}
                />
                {methods.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {methods.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    className="h-11 pr-10"
                    {...methods.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {methods.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {methods.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none text-muted-foreground cursor-pointer"
                  >
                    Manter conectado
                  </label>
                </div>
                <Link
                  href={routes.auth.forgotPassword()}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueci a senha
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg font-semibold"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </FormProvider>

          <div className="mt-8 text-center border-t pt-6">
            <p className="text-muted-foreground/70 text-xs">
              Ambiente de demonstração · perfil Coordenação
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withPageRequiredGuest(LoginPageContent);
