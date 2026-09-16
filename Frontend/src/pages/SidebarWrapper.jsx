import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        
        <Outlet />
      </main>
    </SidebarProvider>
  );
}