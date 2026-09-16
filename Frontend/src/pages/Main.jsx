import React, { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { socket } from "../websocket/socket.config.js";
import { messageRequest } from "../services/service.js";

const Main = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const threadId = "123456";

  // =====================================================
  // SOCKET CONNECTION
  // =====================================================

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected:", socket.id);

      // Join the thread whenever socket connects/reconnects
      socket.emit("joinThread", threadId);
    };

    const handleJobUpdate = (message) => {
      console.log("JOB UPDATE:", message);

      setMessages((prev) => {
        // Find existing job
        const index = prev.findIndex(
          (item) =>
            item.type === "agent" &&
            item.jobId === message.jobId
        );

        // Update existing job
        if (index !== -1) {
          const updatedMessages = [...prev];

          updatedMessages[index] = {
            ...updatedMessages[index],
            ...message,
          };

          return updatedMessages;
        }

        // Add new job
        return [
          ...prev,
          {
            type: "agent",
            ...message,
          },
        ];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("jobUpdate", handleJobUpdate);

    // Socket may already be connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("jobUpdate", handleJobUpdate);
    };
  }, []);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const requestMessage = async () => {
    const userInput = input.trim();

    if (!userInput || sending) {
      return;
    }

    // Immediately display user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: userInput,
        id: `user-${Date.now()}`,
      },
    ]);

    // Clear input
    setInput("");

    setSending(true);

    try {
      await messageRequest(userInput);
    } catch (error) {
      console.error("Message request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          jobId: `error-${Date.now()}`,
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

  // =====================================================
  // KEYBOARD
  // =====================================================

  const handleKeyDown = (event) => {
    // Enter -> send
    // Shift + Enter -> new line
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      requestMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">

      {/* Sidebar */}
      <SidebarTrigger />

      <main className="flex-1 flex flex-col min-h-screen">

        {/* =================================================
            CHAT AREA
        ================================================= */}

        <div className="flex-1 overflow-y-auto px-6">

          <div className="max-w-3xl mx-auto py-10">

            {/* EMPTY STATE */}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[70vh]">

                <h1 className="text-3xl font-semibold">
                  Hey Karan 👋
                </h1>

                <p className="text-zinc-500 mt-2">
                  What do you want to build today?
                </p>

              </div>
            )}

            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="space-y-8">

              {messages.map((message, index) => (
                <div
                  key={
                    message.id ||
                    message.jobId ||
                    `${message.type}-${index}`
                  }
                >

                  {/* =========================
                      USER MESSAGE
                  ========================= */}

                  {message.type === "user" && (
                    <div className="flex justify-end">

                      <div
                        className="
                          max-w-[75%]
                          bg-zinc-800
                          rounded-2xl
                          px-4
                          py-3
                          text-sm
                          whitespace-pre-wrap
                          break-words
                        "
                      >
                        {message.content}
                      </div>

                    </div>
                  )}

                  {/* =========================
                      AGENT MESSAGE
                  ========================= */}

                  {message.type === "agent" && (
                    <AgentMessage message={message} />
                  )}

                </div>
              ))}

              <div ref={messagesEndRef} />

            </div>
          </div>
        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div className="px-6 pb-5">

          <div className="max-w-3xl mx-auto">

            <div
              className="
                border
                border-white/10
                rounded-xl
                bg-[#111114]
                overflow-hidden
              "
            >

              <Textarea
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe your coding task..."
                disabled={sending}
                className="
                  min-h-[60px]
                  max-h-[200px]
                  resize-none
                  border-0
                  bg-transparent
                  focus-visible:ring-0
                  text-sm
                  px-4
                  pt-4
                  disabled:opacity-60
                "
              />

              <div className="flex justify-end p-3">

                <button
                  onClick={requestMessage}
                  disabled={!input.trim() || sending}
                  className="
                    h-8
                    w-8
                    rounded-full
                    bg-white
                    text-black
                    flex
                    items-center
                    justify-center
                    hover:bg-zinc-200
                    disabled:opacity-30
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  <ArrowUp size={15} />
                </button>

              </div>
            </div>

            <p
              className="
                text-center
                text-xs
                text-zinc-600
                mt-2
              "
            >
              Agent can generate and execute code
            </p>

          </div>
        </div>

      </main>
    </div>
  );
};


// =====================================================
// AGENT MESSAGE
// =====================================================

const AgentMessage = ({ message }) => {

  // =====================================================
  // PROCESSING
  // =====================================================

  if (message.status === "processing") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">

        <div
          className="
            w-2
            h-2
            rounded-full
            bg-zinc-500
            animate-pulse
          "
        />

        <span>Agent is thinking...</span>

      </div>
    );
  }


  // =====================================================
  // RUNNING
  // =====================================================

  if (message.status === "running") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">

        <div
          className="
            w-2
            h-2
            rounded-full
            bg-yellow-500
            animate-pulse
          "
        />

        <span>Running code...</span>

      </div>
    );
  }


  // =====================================================
  // FIXING
  // =====================================================

  if (message.status === "fixing") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">

        <div
          className="
            w-2
            h-2
            rounded-full
            bg-white
            animate-pulse
          "
        />

        <span>Fixing code...</span>

      </div>
    );
  }


  // =====================================================
  // FAILED
  // =====================================================

  if (message.status === "failed") {
    return (
      <div className="max-w-[90%]">

        <div className="text-sm text-red-400 mb-2">
          Execution failed
        </div>

        {message.error && (
          <pre
            className="
              bg-[#111114]
              border
              border-red-500/20
              rounded-xl
              p-4
              text-sm
              text-red-300
              whitespace-pre-wrap
              break-words
              overflow-x-auto
            "
          >
            {message.error}
          </pre>
        )}

      </div>
    );
  }


  // =====================================================
  // COMPLETED
  // =====================================================

  if (message.status === "completed") {
    return (
      <div className="max-w-[90%] space-y-5">

        {/* =========================
            SUCCESS HEADER
        ========================= */}

        <div className="flex items-center gap-2 text-sm text-green-400">

          <div
            className="
              w-5
              h-5
              rounded-full
              bg-green-500/10
              flex
              items-center
              justify-center
              text-xs
            "
          >
            ✓
          </div>

          <span>
            Code executed successfully
          </span>

        </div>


        {/* =========================
            GENERATED CODE
        ========================= */}

        {message.code && (
          <div>

            <p
              className="
                text-xs
                text-zinc-500
                mb-2
              "
            >
              Generated code
            </p>

            <div
              className="
                bg-[#111114]
                border
                border-white/10
                rounded-xl
                overflow-hidden
              "
            >

              {/* CODE HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-4
                  py-2
                  border-b
                  border-white/10
                "
              >

                <span className="text-xs text-zinc-400">
                  {message.language || "Code"}
                </span>

                <span className="text-xs text-zinc-600">
                  Job #{message.jobId}
                </span>

              </div>

              {/* CODE */}

              <pre
                className="
                  p-4
                  text-sm
                  leading-6
                  text-zinc-300
                  overflow-x-auto
                  whitespace-pre
                "
              >
                <code>
                  {message.code}
                </code>
              </pre>

            </div>
          </div>
        )}


        {/* =========================
            OUTPUT
        ========================= */}

        <div>

          <p
            className="
              text-xs
              text-zinc-500
              mb-2
            "
          >
            Output
          </p>

          <pre
            className="
              bg-black
              border
              border-white/10
              rounded-xl
              p-4
              text-sm
              text-zinc-300
              whitespace-pre-wrap
              break-words
              overflow-x-auto
            "
          >
            {message.result !== undefined &&
            message.result !== null &&
            message.result !== ""
              ? message.result
              : "No output"}
          </pre>

        </div>

      </div>
    );
  }

  return null;
};

export default Main;