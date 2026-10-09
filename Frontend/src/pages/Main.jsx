import React, { useEffect, useRef, useState ,useContext} from "react";
import { ArrowUp } from "lucide-react";
import { UserConetxt } from "./UserProvider.jsx";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { socket } from "../websocket/socket.config.js";
import { messageRequest, getHistory } from "../services/service.js";
import { AgentMessage } from "./extra.jsx";
import { useParams } from "react-router-dom";

const Main = () => {
  const data =  useContext(UserConetxt)
  const {threadId} = useParams()
  const  THREAD_ID = threadId
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {

    const loadHistory = async () => {

      try {

        setLoadingHistory(true);
        const response = await getHistory(THREAD_ID);
        const executions = response || [];
        const history = [];
        executions.forEach((execution) => {
          if (execution.user) {
            history.push({
              id: `user-${execution.jobId}`,
              role: "user",
              type: "user",
              content: execution.user,
            });
          }

          history.push({

            id: `agent-${execution.jobId}`,
            role: "agent",
            status: "completed",
            jobId: execution.jobId,
            type: execution.type,
            executionTime:execution.executionTime,
            iteration:execution.iteration,
            success:execution.success,
            language: execution.language,
            code: execution.code,
            result: execution.result,
            message: execution.agent,
          });

        });
        setMessages(history);
      } catch (error) {
        console.error(
          "Failed to load chat history:",
          error
        );
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();

  }, [threadId]);

  useEffect(() => {
    const handleConnect = () => {
      console.log(
        "Connected:",
        socket.id
      );
      socket.emit(
        "joinThread",
        THREAD_ID
      );
    };
    const handleJobUpdate = (message) => {
      console.log(
        "JOB UPDATE:",
        message
      );
      setMessages((prev) => {
        const index = prev.findIndex(
          (item) =>
            String(item.jobId) ===
            String(message.jobId)
        );
        const updatedMsg = {
          role: "agent",
          ...message,
        };
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            ...updatedMsg,
          };
          return updated;
        }
        return [
          ...prev,
          updatedMsg,
        ];
      });
    };
    socket.on(
      "connect",
      handleConnect
    );
    socket.on(
      "jobUpdate",
      handleJobUpdate
    );
    if (socket.connected) {
      handleConnect();
    }
    return () => {
      socket.off(
        "connect",
        handleConnect
      );
      socket.off(
        "jobUpdate",
        handleJobUpdate
      );
    };
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const requestMessage = async () => {
    const userInput = input.trim();
    if (!userInput || sending) {
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        type: "user",
        content: userInput,
      },

    ]);
    setInput("");
    setSending(true);
    try {
      await messageRequest(
        userInput,THREAD_ID
      );

    } catch (error) {
      console.error(
        "Message request failed:",
        error
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "agent",
          status: "failed",
          error:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while sending the request.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      requestMessage();
    }

  };
  
  return (

    <div className="min-h-screen bg-[#09090b] text-white flex">

      <SidebarTrigger />


      <main className="flex-1 flex flex-col min-h-screen">


        <div className="flex-1 overflow-y-auto px-6">

          <div className="max-w-3xl mx-auto py-10">

            {loadingHistory && (

              <div className="flex justify-center py-10">

                <span className="text-sm text-zinc-500">
                  Loading conversation...
                </span>

              </div>

            )}

            {!loadingHistory &&
              messages.length === 0 && (

                <div className="flex flex-col items-center justify-center h-[70vh]">

                  <h1 className="text-3xl font-semibold">
                    Hey {data?.user?.username} 
                  </h1>

                  <p className="text-zinc-500 mt-2">
                    What do you want to build today?
                  </p>

                </div>

              )}


            <div className="space-y-8">

              {messages.map(
                (msg, index) => (

                  <div
                    key={
                      msg.id ||
                      msg.jobId ||
                      `${msg.role}-${index}`
                    }
                  >
                    {msg.role === "user" ||
                    msg.type === "user" ? (

                      <div className="flex justify-end">

                        <div className="max-w-[75%] bg-zinc-800 rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words">

                          {msg.content}

                        </div>

                      </div>

                    ) : (

                      <AgentMessage
                        message={msg}
                      />

                    )}

                  </div>

                )
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
        <div className="px-6 pb-5">

          <div className="max-w-3xl mx-auto">

            <div className="border border-white/10 rounded-xl bg-[#111114] overflow-hidden">

              <Textarea

                value={input}

                onChange={(e) =>
                  setInput(e.target.value)
                }

                onKeyDown={handleKeyDown}

                placeholder="Describe your coding task..."

                disabled={sending}

                className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm px-4 pt-4 disabled:opacity-60"
              />

              <div className="flex justify-end p-3">
                <button
                  onClick={requestMessage}
                  disabled={
                    !input.trim() ||
                    sending
                  }
                  className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ArrowUp size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Main;