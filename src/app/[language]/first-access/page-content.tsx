"use client";
import { Button } from "@/components/ui/button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthFirstAccessService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useEffect, useMemo, useState } from "react";

type FirstAccessFormData = {
  password: string;
  passwordConfirmation: string;
};

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .required("A senha é obrigatória"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirme a senha"),
});

function FormActions() {
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      data-testid="set-first-access-password"
    >
      Definir senha e acessar
    </Button>
  );
}

function ExpiresAlert() {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const expires = useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return Number(params.get("expires"));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      if (expires < now) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expires]);

  const isExpired = expires < currentTime;

  return (
    isExpired && (
      <div className="col-span-12">
        <div
          role="alert"
          data-testid="first-access-link-expired-alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Esse link de primeiro acesso expirou. Peça ao administrador para
          reenviar o convite.
        </div>
      </div>
    )
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthFirstAccess = useAuthFirstAccessService();
  const [serverError, setServerError] = useState<string | null>(null);

  const methods = useForm<FirstAccessFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    setServerError(null);
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");
    if (!hash) return;

    const { data, status } = await fetchAuthFirstAccess({
      password: formData.password,
      hash,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      setServerError(
        "Esse link de primeiro acesso é inválido, já foi usado ou expirou."
      );
      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user);
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full max-w-md px-4">
        <form onSubmit={onSubmit}>
          <div className="mb-4 grid grid-cols-12 gap-4">
            <div className="col-span-12 mt-6">
              <h1 className="text-xl font-semibold">
                Bem-vindo! Defina sua senha de acesso
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sua conta já foi criada pelo administrador. Escolha uma senha
                para ativar seu acesso.
              </p>
            </div>
            <ExpiresAlert />
            {serverError && (
              <div className="col-span-12">
                <div
                  role="alert"
                  data-testid="first-access-error-alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {serverError}
                </div>
              </div>
            )}
            <div className="col-span-12">
              <FormTextInput<FirstAccessFormData>
                name="password"
                label="Senha"
                type="password"
                testId="password"
              />
            </div>
            <div className="col-span-12">
              <FormTextInput<FirstAccessFormData>
                name="passwordConfirmation"
                label="Confirmação de senha"
                type="password"
                testId="password-confirmation"
              />
            </div>

            <div className="col-span-12">
              <FormActions />
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

function FirstAccess() {
  return <Form />;
}

export default withPageRequiredGuest(FirstAccess);
