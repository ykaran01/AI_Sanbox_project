import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { getUserchatHistory } from "@/services/service";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom";
import { UserConetxt } from "./UserProvider.jsx";
import { useContext } from "react"
export function AppSidebar() {
  const navigate =  useNavigate()
  const [exampleTasks, setexampleTasks] = useState([])
  const {user} =  useContext(UserConetxt)
 


  useEffect(() => {

    const func = async () => {

      const data = await getUserchatHistory()
      setexampleTasks(data)
    }
    func()
  }, [])

  return (
    <Sidebar className="bg-zinc-950">
      <SidebarHeader className="bg-zinc-950 border-b border-slate-800">
        <h1 className="text-lg text-white font-bold px-2">
          Agent
        </h1>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950">
        <SidebarGroup className="gap-3">

          <button 
            onClick={()=>{
              naviagate('/')
            }}
          className="flex items-center justify-center gap-2 bg-white text-black rounded-xl font-semibold py-2 hover:bg-zinc-200 transition">
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
                  value={task.threadId}
                  onClick={()=>{
                    navigate(`chat/${task.threadId}`)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs  truncate text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
                >
                  {task.userprompt}
                </button>
              ))}
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-zinc-950"> 
        <button className="flex w-full bg-zinc-800 p-2 rounded-2xl gap-4 items-center">
          <div className="" >
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
            </div>
          <div className="text-white text-sm">
           <p>{user?.username} </p>   
          </div>
        </button>

      </SidebarFooter>
    </Sidebar>
  );
}