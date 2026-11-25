import type { Metadata } from "next";

export const APP_NAME = "Ambienta";

/** Metadata padrão das telas: "<Título> · Ambienta". */
export function pageMetadata(title: string): Metadata {
  return { title: `${title} · ${APP_NAME}` };
}
