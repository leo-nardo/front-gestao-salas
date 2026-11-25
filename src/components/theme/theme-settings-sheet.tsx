"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import Moon from "lucide-react/dist/esm/icons/moon";
import Palette from "lucide-react/dist/esm/icons/palette";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Sun from "lucide-react/dist/esm/icons/sun";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  resetThemeSettings,
  setThemeSettings,
  useThemeSettings,
  type SidebarStyle,
  type ThemeColor,
  type ThemeDensity,
  type ThemeRadius,
} from "@/stores/theme-store";

const MODES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

const COLORS: { value: ThemeColor; label: string; swatch: string }[] = [
  { value: "blue", label: "Azul", swatch: "#1a4f8a" },
  { value: "emerald", label: "Verde", swatch: "#0f766e" },
  { value: "violet", label: "Violeta", swatch: "#6d4bc4" },
  { value: "rose", label: "Rosa", swatch: "#be3a5a" },
];

const RADII: { value: ThemeRadius; label: string }[] = [
  { value: "sm", label: "Pequeno" },
  { value: "md", label: "Médio" },
  { value: "lg", label: "Grande" },
];

const DENSITIES: { value: ThemeDensity; label: string }[] = [
  { value: "compact", label: "Compacta" },
  { value: "normal", label: "Normal" },
  { value: "comfortable", label: "Confortável" },
];

const SIDEBAR_STYLES: { value: SidebarStyle; label: string }[] = [
  { value: "dark", label: "Escura" },
  { value: "light", label: "Clara" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
        selected
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

export function ThemeSettingsSheet() {
  const settings = useThemeSettings();
  const { theme, setTheme } = useTheme();
  // next-themes só conhece o tema depois da hidratação
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aparência">
          <Palette className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[360px] overflow-x-hidden overflow-y-auto sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle>Aparência</SheetTitle>
          <SheetDescription>
            Preferências salvas neste navegador.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <Section title="Modo">
            <div className="flex gap-2">
              {MODES.map(({ value, label, icon: Icon }) => (
                <Choice
                  key={value}
                  selected={mounted && theme === value}
                  onClick={() => setTheme(value)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          <Section title="Cor de destaque">
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map(({ value, label, swatch }) => (
                <Choice
                  key={value}
                  selected={settings.color === value}
                  onClick={() => setThemeSettings({ color: value })}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: swatch }}
                  />
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          <Section title="Cantos">
            <div className="flex gap-2">
              {RADII.map(({ value, label }) => (
                <Choice
                  key={value}
                  selected={settings.radius === value}
                  onClick={() => setThemeSettings({ radius: value })}
                >
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          <Section title="Densidade">
            <div className="flex gap-2">
              {DENSITIES.map(({ value, label }) => (
                <Choice
                  key={value}
                  selected={settings.density === value}
                  onClick={() => setThemeSettings({ density: value })}
                >
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          <Section title="Barra lateral">
            <div className="flex gap-2">
              {SIDEBAR_STYLES.map(({ value, label }) => (
                <Choice
                  key={value}
                  selected={settings.sidebarStyle === value}
                  onClick={() => setThemeSettings({ sidebarStyle: value })}
                >
                  {label}
                </Choice>
              ))}
            </div>
          </Section>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              resetThemeSettings();
              setTheme("system");
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar padrão
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
