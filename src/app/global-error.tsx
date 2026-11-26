"use client";

// Último recurso: erro no próprio layout raiz. Precisa trazer <html>/<body>
// e não pode depender de providers (tema, idioma, auth).
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          margin: 0,
        }}
      >
        <main data-testid="global-error">
          <h1 style={{ fontSize: "1.5rem" }}>Algo deu errado</h1>
          <p style={{ color: "#666" }}>
            Não foi possível carregar o sistema. Tente novamente.
          </p>
          <button onClick={reset} style={{ marginTop: "1rem" }}>
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
