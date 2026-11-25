"use client";

import { routes } from "@/routes";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { UsuarioForm, UsuarioFormData } from "../../usuario-form";
import {
  useGetUserService,
  usePatchUserService,
} from "@/services/api/services/users";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent({ id }: { id: string }) {
  const router = useRouter();
  const getUser = useGetUserService();
  const patchUser = usePatchUserService();

  const { data: userRes, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser({ id }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const user =
    userRes?.status === HTTP_CODES_ENUM.OK ? userRes.data : undefined;

  const defaultValues: Partial<UsuarioFormData> | undefined = user
    ? {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        roleId: user.role?.id ? String(user.role.id) : "",
      }
    : undefined;

  return (
    <>
      <AdminHeader title="Editar usuário" />
      <UsuarioForm
        title="Editar usuário"
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        successMessage="Usuário atualizado com sucesso!"
        defaultValues={defaultValues}
        onSave={(data: UsuarioFormData) =>
          patchUser({
            id,
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              role: { id: Number(data.roleId) },
            },
          })
        }
        onSaved={() => router.push(routes.usuarios.admin.list())}
      />
    </>
  );
}
