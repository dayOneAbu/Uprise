import { Sidebar } from "~/app/_components/admin/sidebar";
import { Header } from "~/app/_components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />
        {children}
      </div>
    </div>
  );
}
