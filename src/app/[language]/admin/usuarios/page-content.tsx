"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import UsersIcon from "lucide-react/dist/esm/icons/users";
import Edit from "lucide-react/dist/esm/icons/edit";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Send from "lucide-react/dist/esm/icons/send";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { useGetUsersService } from "@/services/api/services/users";
import { useAuthSendFirstAccessInviteService } from "@/services/api/services/auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { StatusEnum } from "@/services/api/types/status";
import { SortEnum } from "@/services/api/types/sort-type";
import { User } from "@/services/api/types/user";

function SendInviteButton({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const sendFirstAccessInvite = useAuthSendFirstAccessInviteService();

  const { mutate, isPending } = useMutation({
    mutationFn: () => sendFirstAccessInvite({ userId: user.id }),
    onSuccess: (res) => {
      if (res.status === HTTP_CODES_ENUM.NO_CONTENT) {
        toast.success(`Convite enviado para ${user.email}.`);
        queryClient.invalidateQueries({ queryKey: ["users-list"] });
        return;
      }
      toast.error("Não foi possível enviar o convite. Tente novamente.");
    },
    onError: () => {
      toast.error("Não foi possível enviar o convite. Tente novamente.");
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      disabled={isPending}
      onClick={() => mutate()}
      data-testid={`send-invite-${user.email}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
      ) : (
        <Send className="w-3.5 h-3.5 mr-1" />
      )}
      Enviar convite
    </Button>
  );
}

export default function PageContent() {
  const getUsers = useGetUsersService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 50,
        sort: [{ orderBy: "createdAt", order: SortEnum.DESC }],
      }),
  });
  const users = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  const columns: DataTableColumn<User>[] = [
    {
      header: "Nome",
      cell: (u) => (
        <span className="font-medium text-foreground">
          {u.firstName} {u.lastName}
        </span>
      ),
    },
    {
      header: "E-mail",
      cell: (u) => (
        <span className="text-muted-foreground font-mono text-sm">
          {u.email}
        </span>
      ),
    },
    {
      header: "Papel",
      cell: (u) => (
        <Badge variant="outline" className="font-normal">
          {u.role?.name || "Sem papel"}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (u) =>
        u.status?.id === StatusEnum.INACTIVE ? (
          <Badge
            variant="outline"
            className="bg-warning-bg border-transparent text-warning font-normal"
          >
            Pendente
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-success-bg border-transparent text-success font-normal"
          >
            Ativo
          </Badge>
        ),
    },
    {
      header: "Ações",
      cell: (u) => (
        <div className="flex items-center">
          <Link href={`/admin/usuarios/${u.id}/editar`}>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Edit className="w-3.5 h-3.5 mr-1" />
              Editar
            </Button>
          </Link>
          {u.status?.id === StatusEnum.INACTIVE && (
            <SendInviteButton user={u} />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Usuários"
        subtitle="Gestão de usuários e permissões do sistema"
      />

      <div className="p-6 max-w-[1000px] mx-auto w-full space-y-4">
        <div className="flex justify-end">
          <Link href="/admin/usuarios/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo usuário
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          getRowKey={(u) => String(u.id)}
          searchValue={(u) => `${u.firstName} ${u.lastName} ${u.email}`}
          searchPlaceholder="Buscar por nome ou e-mail…"
          emptyState={{
            icon: <UsersIcon className="w-8 h-8" />,
            title: "Nenhum usuário encontrado",
          }}
        />
      </div>
    </>
  );
}
