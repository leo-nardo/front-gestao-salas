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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      className="h-8 text-[#1a4f8a] hover:text-[#123c6e] px-2"
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

  return (
    <>
      <AdminHeader
        title="Usuários"
        subtitle="Gestão de usuários e permissões do sistema"
      />

      <div className="p-6 max-w-[1000px] mx-auto w-full">
        <div className="flex justify-end mb-6">
          <Link href="/admin/usuarios/novo">
            <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo usuário
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : users.length === 0 ? (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhum usuário encontrado
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e6e5e0] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#faf9f5]">
                <TableRow className="border-b-[#f0efea]">
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Nome
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    E-mail
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Papel
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isPending = u.status?.id === StatusEnum.INACTIVE;

                  return (
                    <TableRow key={u.id} className="border-b-[#f0efea]">
                      <TableCell className="font-medium text-[#1c1f21]">
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell className="text-[#6f767b] font-mono text-sm">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-[#f0efea] border-[#dddbd3] text-[#1c1f21] font-normal"
                        >
                          {u.role?.name || "Sem papel"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isPending ? (
                          <Badge
                            variant="outline"
                            className="bg-[#fdf3e0] border-[#e8c98a] text-[#8a6417] font-normal"
                          >
                            Pendente
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-[#e5f3ea] border-[#a8d8b8] text-[#1c6b3c] font-normal"
                          >
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Link href={`/admin/usuarios/${u.id}/editar`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-[#1a4f8a] hover:text-[#123c6e] px-2"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Editar
                            </Button>
                          </Link>
                          {isPending && <SendInviteButton user={u} />}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
