"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDisciplinasService } from "@/services/api/services/disciplinas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getDisciplinas = useGetDisciplinasService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["disciplinas"],
    queryFn: () => getDisciplinas(),
  });
  const disciplinas = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <>
      <AdminHeader
        title="Disciplinas"
        subtitle="Disciplinas cadastradas por curso"
      />

      <div className="p-6 max-w-[900px] mx-auto w-full">
        <div className="flex justify-end mb-6">
          <Link href="/admin/disciplinas/nova">
            <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova disciplina
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : disciplinas.length === 0 ? (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhuma disciplina cadastrada
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e6e5e0] overflow-hidden">
            <Table>
              <TableHeader className="bg-[#faf9f5]">
                <TableRow className="border-b-[#f0efea]">
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Disciplina
                  </TableHead>
                  <TableHead className="font-semibold text-[#1c1f21]">
                    Curso
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinas.map((d) => (
                  <TableRow key={d.id} className="border-b-[#f0efea]">
                    <TableCell className="font-medium text-[#1c1f21]">
                      {d.nome}
                    </TableCell>
                    <TableCell className="text-[#6f767b]">
                      {d.curso.nome}
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
