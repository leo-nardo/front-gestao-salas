"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  clampSidebarWidth,
  previewSidebarWidth,
  resetSidebarWidth,
  setLayoutSettings,
} from "@/stores/layout-store";

const KEYBOARD_STEP = 16;

type SidebarResizeHandleProps = {
  width: number;
  /** Elemento da barra lateral, usado para medir a posição esquerda. */
  getSidebarElement: () => HTMLElement | null;
};

/** Alça de arraste na borda direita da barra lateral. */
export function SidebarResizeHandle({
  width,
  getSidebarElement,
}: SidebarResizeHandleProps) {
  const dragging = useRef(false);
  const lastWidth = useRef(width);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    lastWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const left = getSidebarElement()?.getBoundingClientRect().left ?? 0;
    lastWidth.current = clampSidebarWidth(event.clientX - left);
    previewSidebarWidth(lastWidth.current);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setLayoutSettings({ sidebarWidth: lastWidth.current });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = width - KEYBOARD_STEP;
    else if (event.key === "ArrowRight") next = width + KEYBOARD_STEP;
    else if (event.key === "Home") next = SIDEBAR_MIN_WIDTH;
    else if (event.key === "End") next = SIDEBAR_MAX_WIDTH;
    if (next === null) return;
    event.preventDefault();
    setLayoutSettings({ sidebarWidth: next });
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar barra lateral"
      aria-valuemin={SIDEBAR_MIN_WIDTH}
      aria-valuemax={SIDEBAR_MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={resetSidebarWidth}
      onKeyDown={onKeyDown}
      className={cn(
        "absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize touch-none",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2",
        "after:bg-transparent hover:after:bg-sidebar-ring focus-visible:after:bg-sidebar-ring",
        "focus-visible:outline-none"
      )}
    />
  );
}
