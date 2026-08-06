"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import UsersIcon from "lucide-react/dist/esm/icons/users";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
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
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getUsers = useGetUsersService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => getUsers({ page: 1, limit: 50 }),
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
