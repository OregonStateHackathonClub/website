"use client";

import { ReactNode } from "react";

type PanelProps = {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export const Panel = ({
  title,
  icon,
  children,
  className = "",
  contentClassName = "",
}: PanelProps) => {
  return (
    <div
      className={`border border-amber-muted/30 bg-screen-dark/50 flex flex-col ${className}`}
    >
      {title && (
        <div className="shrink-0 flex items-center gap-2 px-2 py-1 border-b border-amber-muted/30 bg-amber-muted/10">
          {icon && <span className="text-amber-bright text-xs">{icon}</span>}
          <span className="text-amber-bright text-xs font-primary tracking-wider uppercase">
            {title}
          </span>
        </div>
      )}
      <div className={`p-2 flex-1 min-h-0 ${contentClassName}`}>{children}</div>
    </div>
  );
};
