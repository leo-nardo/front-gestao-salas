"use client";

import { PageContainer } from "@/components/layout/page-container";
import { UsuarioEditDrawer } from "./usuario-edit-drawer";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import UsersIcon from "lucide-react/dist/esm/icons/users";
import Pencil from "lucide-react/dist/esm/icons/pencil";
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

function useSendInvite() {
  const queryClient = useQueryClient();
  const sendFirstAccessInvite = useAuthSendFirstAccessInviteService();

  return useMutation({
    mutationFn: (user: User) => sendFirstAccessInvite({ userId: user.id }),
    onSuccess: (res, user) => {
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
}

export default function PageContent() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const getUsers = useGetUsersService();
  const sendInvite = useSendInvite();
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
      sortValue: (u) => `${u.firstName} ${u.lastName}`,
      cell: (u) => (
        <span className="font-medium text-foreground">
          {u.firstName} {u.lastName}
        </span>
      ),
    },
    {
      header: "E-mail",
      sortValue: (u) => u.email,
      cell: (u) => (
        <span className="text-muted-foreground font-mono text-sm">
          {u.email}
        </span>
      ),
    },
    {
      header: "Papel",
      sortValue: (u) => u.role?.name,
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
  ];

  return (
    <>
      <AdminHeader
        title="Usuários"
        subtitle="Gestão de usuários e permissões do sistema"
      />

      <PageContainer className="space-y-4">
        <div className="flex justify-end">
          <Link href="/admin/usuarios/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo usuário
            </Button>
          </Link>
        </div>

        <DataTable
          rowActions={(u) => [
            {
              label: "Editar",
              icon: <Pencil className="size-4" />,
              onSelect: () => setEditingId(String(u.id)),
            },
            u.status?.id === StatusEnum.INACTIVE && {
              label: "Enviar convite",
              icon: <Send className="size-4" />,
              disabled: sendInvite.isPending,
              onSelect: () => sendInvite.mutate(u),
              testId: `send-invite-${u.email}`,
            },
          ]}
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
      </PageContainer>

      <UsuarioEditDrawer id={editingId} onClose={() => setEditingId(null)} />
    </>
  );
}
