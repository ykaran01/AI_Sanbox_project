import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Settings, Plus } from "lucide-react";

export function AppSidebar() {
  const exampleTasks = [
    "Build a REST API with Express",
    "Fix this JavaScript error",
    "Create a binary search solution",
    "Write a Python web scraper",
    "Implement JWT authentication",
  ];

  return (
    <Sidebar className="bg-zinc-950">
      <SidebarHeader className="bg-zinc-950 border-b border-slate-800">
        <h1 className="text-lg text-white font-bold px-2">
          Agent
        </h1>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950">
        <SidebarGroup className="gap-3">
         
          <button className="flex items-center justify-center gap-2 bg-white text-black rounded-xl font-semibold py-2 hover:bg-zinc-200 transition">
            <Plus size={16} />
            New Task
          </button>

         
          <div className="mt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase px-2 mb-2">
              Previous Tasks
            </p>

            <div className="space-y-1">
              {exampleTasks.map((task, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
                >

                  {task}
            
            
                </button>
              ))}
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-zinc-950">
        <button className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 hover:text-white">
          <Settings size={16} />
          Settings
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}