import React, { useState } from "react";
import { Copy, Check, Clock, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

export const AgentMessage = ({ message }) => {
    if (message.status === "generating") {
        return <Status text="Agent is thinking..." />;
    }

    if (message.status === "running") {
        return <Status text="Running code..." />;
    }

    if (message.status === "queued") {
        return <Status text="Queued..." />;
    }

    if (message.status === "fixing") {
        return <Status text="Fixing code..." />;
    }

    const isCompleted = message.status === "completed";
    const hasCode = Boolean(message.code);
    const isCode = message.type === "code" || hasCode;
    const executionSucceeded =
        message.success === true ||
        (isCompleted && message.success !== false && !message.error);

    const executionTime = Number(message.executionTime ?? 0);
    const iteration = Number(message.iteration ?? 0);
    const maxIterations = Number(message.maxIterations ?? 3);

    const showMetrics =
        isCompleted ||
        message.status === "failed" ||
        message.success === true ||
        message.success === false;
    if (isCode && (hasCode || showMetrics)) {
        return (
            <div className="max-w-[90%] space-y-4">
                {showMetrics && (
                    <div
                        className={`flex items-center gap-2 text-sm ${
                            executionSucceeded
                                ? "text-green-400"
                                : "text-red-400"
                        }`}
                    >
                        {executionSucceeded ? (
                            <CheckCircle2 size={16} />
                        ) : (
                            <XCircle size={16} />
                        )}

                        <span>
                            {executionSucceeded
                                ? "Execution successful"
                                : hasCode?"Failed in Sanboxing":"Execution failure"}
                        </span>
                    </div>
                )}

                {showMetrics && (
                    <div className="flex flex-wrap gap-3">
                        <Metric
                            icon={<Clock size={14} />}
                            label="Execution time"
                            value={`${executionTime} ms`}
                        />

                        <Metric
                            icon={<RotateCcw size={14} />}
                            label="Fix attempts"
                            value={`${iteration} / ${maxIterations}`}
                        />
                    </div>
                )}

                {message.code && (
                    <CodeBlock
                        code={message.code}
                        language={message.language}
                        jobId={message.jobId || message.executionId}
                    />
                )}

                {message.stdin && (
                    <Output value={message.stdin} title="Input" />
                )}

                {message.result != null && message.result !== "" && (
                    <Output
                        value={message.result}
                        title="Output"
                        error={!executionSucceeded}
                    />
                )}

                {message.error && (
                    <Output value={message.error} title="Error" error />
                )}

                {message.message && (
                    <Output value={message.message} title="Agent message" />
                )}
            </div>
        );
    }

    if (message.status === "failed") {
        return (
            <div className="max-w-[90%] space-y-3">
                <p className="flex items-center gap-2 text-sm text-red-400">
                    <XCircle size={16} />
                    Agent failed
                </p>

                {showMetrics && (
                    <div className="flex flex-wrap gap-3">
                        <Metric
                            icon={<Clock size={14} />}
                            label="Execution time"
                            value={`${executionTime} ms`}
                        />

                        <Metric
                            icon={<RotateCcw size={14} />}
                            label="Fix attempts"
                            value={`${iteration} / ${maxIterations}`}
                        />
                    </div>
                )}

                {message.error && (
                    <Output value={message.error} title="Error" error />
                )}
            </div>
        );
    }

    if (message.type === "message" && message.message) {
        return <Output value={message.message} />;
    }

    return null;
};

const Metric = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111114] px-3 py-2">
        <span className="text-zinc-400">{icon}</span>

        <div>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-sm font-medium text-zinc-200">{value}</p>
        </div>
    </div>
);

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
                    ${
                        title=="Output"?"truncate  max-h-20 ":""
                    }
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

