import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <TopBar />

      {/* Gold accent divider */}
      <div className="fixed top-14 left-0 right-0 h-[2px] bg-[#C9A24D] z-40" />

      <Sidebar />

      {/* Main content */}
      <main className="ml-64 pt-16 px-6 bg-white text-black flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
        {children}
        <Footer />
      </main>
    </div>
  );
};