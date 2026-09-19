export const AgentMessage = ({ message }) => {
  if (message.status === "processing") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
        <span>Agent is thinking...</span>
      </div>
    );
  }

  if (message.status === "running") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span>Running code...</span>
      </div>
    );
  }

  if (message.status === "fixing") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>Fixing code...</span>
      </div>
    );
  }

  if (message.status === "failed") {
    return (
      <div className="max-w-[90%]">
        <div className="text-sm text-red-400 mb-2">Execution failed</div>
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

  if (message.status === "completed") {
    return (
      <div className="max-w-[90%] space-y-5">
        <div className="flex items-center gap-2 text-sm text-green-400">
          <span>
            {message.type === "code" ? "Code executed successfully" : ""}
          </span>
        </div>

        {message.type === "code" && message.code && (
          <div>
            <p className="text-xs text-zinc-500 mb-2">Generated code</p>
            <div className="bg-[#111114] border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-xs text-zinc-400">
                  {message.language || "Code"}
                </span>
                <span className="text-xs text-zinc-600">
                  Job #{message.jobId}
                </span>
              </div>
              <pre className="p-4 text-sm leading-6 text-zinc-300 overflow-x-auto whitespace-pre">
                <code>{message.code}</code>
              </pre>
            </div>
          </div>
        )}

        {message.type === "code" && (
          <div>
            <p className="text-xs text-zinc-500 mb-2">Output</p>
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
             {message.messages.type=='system' && <pre
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
              {message.messages.content  || ""}
            </pre>}
          </div>
          
        )}

        {message.type === "message"    && (
          <div>
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
              {message.messages.content  || "No message output"}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
};