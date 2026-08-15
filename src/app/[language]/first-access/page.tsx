import type { Metadata } from "next";
import FirstAccess from "./page-content";

export const metadata: Metadata = {
  title: "Primeiro acesso",
};

export default function Page() {
  return <FirstAccess />;
}
