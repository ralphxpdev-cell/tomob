import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Sidebar />
      <main className="ml-64 p-6 lg:p-8">{children}</main>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#171717",
            border: "1px solid #262626",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
