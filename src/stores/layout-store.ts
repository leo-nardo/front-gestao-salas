"use client";

import { useSyncExternalStore } from "react";

export type LayoutSettings = {
  /** Largura da barra lateral expandida, em pixels. */
  sidebarWidth: number;
  sidebarCollapsed: boolean;
};

export const SIDEBAR_MIN_WIDTH = 220;
export const SIDEBAR_MAX_WIDTH = 400;
export const SIDEBAR_DEFAULT_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 68;

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  sidebarCollapsed: false,
};

export const LAYOUT_STORAGE_KEY = "gestao-salas-layout";

export function clampSidebarWidth(width: number): number {
  if (!Number.isFinite(width)) return SIDEBAR_DEFAULT_WIDTH;
  return Math.min(
    SIDEBAR_MAX_WIDTH,
    Math.max(SIDEBAR_MIN_WIDTH, Math.round(width))
  );
}

function normalize(raw: unknown): LayoutSettings {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    sidebarWidth:
      typeof data.sidebarWidth === "number"
        ? clampSidebarWidth(data.sidebarWidth)
        : DEFAULT_LAYOUT_SETTINGS.sidebarWidth,
    sidebarCollapsed: data.sidebarCollapsed === true,
  };
}

function read(): LayoutSettings {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : DEFAULT_LAYOUT_SETTINGS;
  } catch {
    return DEFAULT_LAYOUT_SETTINGS;
  }
}

let current: LayoutSettings = DEFAULT_LAYOUT_SETTINGS;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // armazenamento indisponível: a preferência vale só para esta sessão
  }
}

/** Lê o localStorage uma única vez no cliente. */
export function hydrateLayoutSettings() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  current = read();
  emit();
}

export function setLayoutSettings(patch: Partial<LayoutSettings>) {
  current = normalize({ ...current, ...patch });
  persist();
  emit();
}

/**
 * Atualiza a largura durante o arraste sem gravar no localStorage a cada
 * movimento; chame `setLayoutSettings` ao soltar para persistir.
 */
export function previewSidebarWidth(width: number) {
  current = { ...current, sidebarWidth: clampSidebarWidth(width) };
  emit();
}

export function toggleSidebarCollapsed() {
  setLayoutSettings({ sidebarCollapsed: !current.sidebarCollapsed });
}

export function resetSidebarWidth() {
  setLayoutSettings({ sidebarWidth: SIDEBAR_DEFAULT_WIDTH });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLayoutSettings(): LayoutSettings {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT_LAYOUT_SETTINGS
  );
}
