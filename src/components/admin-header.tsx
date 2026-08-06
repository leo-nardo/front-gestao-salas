import Bell from "lucide-react/dist/esm/icons/bell";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="h-[62px] sticky top-0 z-10 flex items-center justify-between px-6 bg-[#fbfaf7] border-b border-[#e6e5e0] shrink-0">
      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-semibold text-[#1c1f21] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#6f767b] leading-tight">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-[#6f767b] font-mono bg-[#f0efea] px-3 py-1 rounded-md border border-[#e6e5e0]">
          2º sem · 2026
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#6f767b] hover:text-[#1c1f21] hover:bg-[#f0efea]"
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
