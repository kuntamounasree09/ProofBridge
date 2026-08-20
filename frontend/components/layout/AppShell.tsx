"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

type AppShellProps = {
  children: React.ReactNode;
  userName?: string;
  showBack?: boolean;
  backHref?: string;
};

export default function AppShell({
  children,
  userName,
  showBack,
  backHref,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userName={userName} showBack={showBack} backHref={backHref} />
        <main className="flex-1 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
