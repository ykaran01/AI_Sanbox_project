
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export const AgentMessage = ({ message }) => {
    if (message.status === "generating") {
        return <Status text="Agent is thinking..." />;
    }

    if (message.status === "running") {
        return <Status text="Running code..." />;
    }

    if (message.status === "fixing") {
        return <Status text="Fixing code..." />;
    }

    if (message.status === "failed") {
        return (
            <div className="max-w-[90%]">
                <p className="text-sm text-red-400 mb-2">
                    Execution failed
                </p>

                {message.error && (
                    <Output
                        value={message.error}
                        error
                    />
                )}
            </div>
        );
    }

    if (message.status === "completed" || message.type) {
        return (
            <div className="max-w-[90%] space-y-4">
                {message.type === "code" && (
                    <>
                        <div className="text-sm text-green-400">
                            Code executed successfully
                        </div>

                        {message.code && (
                            <CodeBlock
                                code={message.code}
                                language={message.language}
                                jobId={message.jobId}
                            />
                        )}

                        {message.stdin && (
                            <Output
                                value={message.stdin}
                                title="Input"
                            />
                        )}

                        {message.result && (
                            <Output

                                value={message.result}
                                title="Output"
                            />
                        )}

                        {message.message && (
                            <Output
                                value={message.message}
                            />
                        )}
                    </>
                )}

                {message.type === "message" && message.message && (
                    <Output value={message.message} />
                )}
            </div>
        );
    }

    return null;
};


const Status = ({ text }) => {
    return (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />

            <span>
                {text}
            </span>
        </div>
    );
};


const Output = ({ value, title, error = false }) => {
    const formattedValue = normalizeText(value);

    return (
        <div>
            {title && (
                <p className="text-xs text-zinc-500 mb-2">
                    {title}
                </p>
            )}

            <pre
                className={`
                    bg-[#111114]
                    border
                    rounded-xl
                    p-4
                    text-sm
                    whitespace-pre-wrap
                    break-words
                    overflow-x-auto
                    ${error
                        ? "border-red-500/20 text-red-300"
                        : "border-white/10 text-zinc-300"
                    }
                `}
            >
                {formattedValue}
            </pre>
        </div>
    );
};


const CodeBlock = ({ code, language, jobId }) => {
    const [copied, setCopied] = useState(false);

    const formattedCode = normalizeCode(code);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedCode);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <div>
            <p className="text-xs text-zinc-500 mb-2">
                Generated code
            </p>

            <div className="bg-[#111114] border border-white/10 rounded-xl overflow-hidden">

      
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">

                    <span className="text-xs text-zinc-400">
                        {language || "Code"}
                    </span>

                    <div className="flex items-center gap-3">

                        {jobId && (
                            <span className="text-xs text-zinc-600">
                                Job #{jobId}
                            </span>
                        )}

                        <button
                            onClick={handleCopy}
                            className="text-zinc-500 hover:text-zinc-300 transition"
                            title="Copy code"
                        >
                            {copied ? (
                                <Check size={14} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>

                    </div>
                </div>

                {/* Code */}
                <pre className="p-4 text-sm leading-6 text-zinc-300 overflow-x-auto whitespace-pre">
                    <code>
                        {formattedCode}
                    </code>
                </pre>

            </div>
        </div>
    );
};




const normalizeCode = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n")
        .replace(/\\"/g, '"');
};

const normalizeText = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n");
};

