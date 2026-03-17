import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin relative">
          {/* Ambient glow blobs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-pink-600/4 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-indigo-600/4 blur-3xl" />
          </div>
          <div className="relative z-10 p-6 max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
