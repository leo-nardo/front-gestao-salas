import Bell from "lucide-react/dist/esm/icons/bell";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="h-[62px] sticky top-0 z-10 flex items-center justify-between px-6 bg-surface-4 border-b border-border shrink-0">
      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-semibold text-foreground leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-muted-foreground font-mono bg-surface-1 px-3 py-1 rounded-md border border-border">
          2º sem · 2026
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
