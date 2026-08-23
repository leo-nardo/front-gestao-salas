"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateCursoService } from "@/services/api/services/cursos";
import { CursoForm } from "../curso-form";

export default function PageContent() {
  const createCurso = useCreateCursoService();

  return (
    <>
      <AdminHeader title="Novo Curso" />
      <CursoForm
        title="Cadastrar curso"
        submitLabel="Cadastrar curso"
        submittingLabel="Salvando..."
        successMessage="Curso cadastrado com sucesso!"
        onSave={(data) => createCurso({ nome: data.nome })}
      />
    </>
  );
}
