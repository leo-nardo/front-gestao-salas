"use client";
import { useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "@/services/i18n/use-language";

type PropsType = {
  params?: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

function withPageRequiredGuest(Component: FunctionComponent<PropsType>) {
  return function PageRequiredGuest(props: PropsType) {
    const { user, isLoaded } = useAuth();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        if (!user || !isLoaded) return;

        const params = new URLSearchParams(window.location.search);
        let returnTo = params.get("returnTo");

        if (!returnTo) {
          const roleId = Number(user?.role?.id);
          switch (roleId) {
            case 1: // ADMIN
              returnTo = `/${language}/admin`;
              break;
            case 7: // ALUNO
              returnTo = `/${language}/aluno/grade`;
              break;
            case 6: // PROFESSOR
              returnTo = `/${language}/professor`;
              break;
            case 3: // AUXILIAR_AUDIOVISUAL
              returnTo = `/${language}/auxiliar`;
              break;
            case 4: // LIMPEZA
              returnTo = `/${language}/limpeza`;
              break;
            case 5: // TECNICO_LABORATORIO
              returnTo = `/${language}/tecnico`;
              break;
            default:
              returnTo = `/${language}`;
          }
        }

        router.replace(returnTo as string);
      };

      check();
    }, [user, isLoaded, router, language]);

    return !user && isLoaded ? <Component {...props} /> : null;
  };
}

export default withPageRequiredGuest;
