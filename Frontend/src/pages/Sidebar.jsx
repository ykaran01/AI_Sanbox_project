import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { Plus, LogOut, Trash2 } from "lucide-react";

import {
  getUserchatHistory,
  logout,
  deleteChat,
} from "@/services/service";

import { useEffect, useState, useContext } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useNavigate } from "react-router-dom";

import { UserConetxt } from "./UserProvider.jsx";

export function AppSidebar() {
  const navigate = useNavigate();

  const [exampleTasks, setexampleTasks] = useState([]);

  const { user, setUserData } = useContext(UserConetxt);

  const onclickhandler = async () => {
    try {
      const data = await logout(setUserData);

      if (data) {
        navigate("/login");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleDelete = async (e, threadId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = await deleteChat(threadId);

      if (data) {
        setexampleTasks((prev) =>
          prev.filter((task) => task.threadId !== threadId)
        );

        if (window.location.pathname === `/chat/${threadId}`) {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  useEffect(() => {
    const func = async () => {
      try {
        const data = await getUserchatHistory();
        setexampleTasks(data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    func();
  }, []);

  return (
    <Sidebar className="bg-zinc-950">
      <SidebarHeader className="bg-zinc-950 border-b border-slate-800">
        <h1 className="text-lg text-white font-bold px-2">
          Box_Agent
        </h1>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950">
        <SidebarGroup className="gap-3">

          <button
            onClick={() => {
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 bg-white text-black rounded-xl font-semibold py-2 hover:bg-zinc-200 transition"
          >
            <Plus size={16} />
            New Task
          </button>

          <div className="mt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase px-2 mb-2">
              Previous Tasks
            </p>

            <div className="space-y-1">

              {exampleTasks.map((task, index) => (
                <div
                  key={task.threadId || index}
                  className="group flex items-center w-full rounded-lg hover:bg-zinc-900 transition"
                >


                  <button
                    onClick={() => {
                      navigate(`/chat/${task.threadId}`);
                    }}
                    className="flex-1 min-w-0 text-left px-3 py-2 text-xs truncate text-zinc-400 group-hover:text-white"
                  >
                    {task.userprompt}
                  </button>


                  <button
                    onClick={(e) => {
                      handleDelete(e, task.threadId);
                    }}
                    title="Delete chat"
                    className="mr-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>
              ))}

            </div>
          </div>

        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-zinc-950">

        <div className="flex w-full bg-zinc-800 p-2 rounded-2xl justify-between gap-4 items-center">

          <div className="flex gap-4 items-center">

            <Avatar>
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="text-white text-sm">
              <p>{user?.username}</p>
            </div>

          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              onclickhandler();
            }}
            title="Logout"
            className="flex p-2 rounded-xl gap-2 items-center hover:bg-zinc-700 transition"
          >
            <LogOut
              color="white"
              size={15}
            />
          </button>

        </div>

      </SidebarFooter>
    </Sidebar>
  );
}