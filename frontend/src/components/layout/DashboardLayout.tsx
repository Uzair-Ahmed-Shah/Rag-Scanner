import { IconSidebar } from './IconSidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex">
      <IconSidebar />
      <main className="flex-1 ml-44 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
