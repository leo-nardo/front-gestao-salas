"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  /** Quais barras o container pode exibir. */
  scrollbars?: "vertical" | "horizontal" | "both";
  /** Classes do viewport (onde o conteúdo rola). */
  viewportClassName?: string;
};

/**
 * Área de rolagem com barra discreta: fina, sobreposta ao conteúdo (não ocupa
 * espaço) e visível só enquanto a pessoa rola (`type="scroll"`). Use `type="hover"`
 * para mostrar também ao passar o mouse.
 */
function ScrollArea({
  className,
  viewportClassName,
  children,
  type = "scroll",
  scrollbars = "vertical",
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      type={type}
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          viewportClassName
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(scrollbars === "vertical" || scrollbars === "both") && <ScrollBar />}
      {(scrollbars === "horizontal" || scrollbars === "both") && (
        <ScrollBar orientation="horizontal" />
      )}
      {scrollbars === "both" && <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-0.5 transition-opacity select-none",
        "data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
        orientation === "vertical" &&
          "h-full w-2 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/60"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
