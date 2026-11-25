"use client";

import { useSyncExternalStore } from "react";

export type ThemeColor = "blue" | "emerald" | "violet" | "rose";
export type ThemeRadius = "sm" | "md" | "lg";
export type ThemeDensity = "compact" | "normal" | "comfortable";
export type SidebarStyle = "dark" | "light";

export type ThemeSettings = {
  color: ThemeColor;
  radius: ThemeRadius;
  density: ThemeDensity;
  sidebarStyle: SidebarStyle;
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  color: "blue",
  radius: "md",
  density: "normal",
  sidebarStyle: "dark",
};

export const THEME_STORAGE_KEY = "gestao-salas-theme";

const COLORS: ThemeColor[] = ["blue", "emerald", "violet", "rose"];
const RADII: ThemeRadius[] = ["sm", "md", "lg"];
const DENSITIES: ThemeDensity[] = ["compact", "normal", "comfortable"];
const SIDEBAR_STYLES: SidebarStyle[] = ["dark", "light"];

function pick<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function normalize(raw: unknown): ThemeSettings {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    color: pick(data.color, COLORS, DEFAULT_THEME_SETTINGS.color),
    radius: pick(data.radius, RADII, DEFAULT_THEME_SETTINGS.radius),
    density: pick(data.density, DENSITIES, DEFAULT_THEME_SETTINGS.density),
    sidebarStyle: pick(
      data.sidebarStyle,
      SIDEBAR_STYLES,
      DEFAULT_THEME_SETTINGS.sidebarStyle
    ),
  };
}

function read(): ThemeSettings {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : DEFAULT_THEME_SETTINGS;
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

let current: ThemeSettings = DEFAULT_THEME_SETTINGS;
let hydrated = false;
const listeners = new Set<() => void>();

export function applyThemeSettings(settings: ThemeSettings) {
  const root = document.documentElement;
  root.setAttribute("data-theme-color", settings.color);
  root.setAttribute("data-theme-radius", settings.radius);
  root.setAttribute("data-theme-density", settings.density);
  root.setAttribute("data-sidebar-style", settings.sidebarStyle);
}

function emit() {
  listeners.forEach((listener) => listener());
}

/** Lê o localStorage uma única vez no cliente e aplica os atributos no <html>. */
export function hydrateThemeSettings() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  current = read();
  applyThemeSettings(current);
  emit();
}

export function setThemeSettings(patch: Partial<ThemeSettings>) {
  current = normalize({ ...current, ...patch });
  applyThemeSettings(current);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // armazenamento indisponível: a preferência vale só para esta sessão
  }
  emit();
}

export function resetThemeSettings() {
  setThemeSettings(DEFAULT_THEME_SETTINGS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useThemeSettings(): ThemeSettings {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT_THEME_SETTINGS
  );
}
