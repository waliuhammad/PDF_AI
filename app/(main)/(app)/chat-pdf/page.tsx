"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCard } from "@/components/tools/upload-card";
import { Send, Bot, User, Sparkles, Upload, FileText, X, ArrowRight, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatPdfPage() {
    const [step, setStep] = useState<"upload" | "chat">("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileMeta, setFileMeta] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFile = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const f = fileList[0];
        if (f.type !== "application/pdf") {
            setError("Please upload a valid PDF document.");
            return;
        }
        setError(null);
        setSelectedFile(f);
        setFileMeta({ name: f.name, size: formatSize(f.size) });
    };

    const handleStartChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || uploading) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            // Optional: Upload/initialize PDF session with your backend
           const res = await fetch("/api/chat/upload", {
    method: "POST",
    body: formData,
});

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to initialize PDF session.");
            }

            setStep("chat");
            setMessages([
                {
                    role: "assistant",
                    content: `I have processed **${selectedFile.name}**. What would you like to know about this document?`,
                },
            ]);
        } catch (err: any) {
            setError(err.message || "Something went wrong uploading the file.");
        } finally {
            setUploading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (step === "chat") scrollToBottom();
    }, [messages, loading, step]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        question: userMessage,
    }),
});

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to get a response from AI.");
            }

            const botReply = data.result.answer;

setMessages((prev) => [
    ...prev,
    {
        role: "assistant",
        content: botReply,
    },
]);
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${err.message || "Something went wrong."}` },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (step === "upload") {
        return (
            <div className="max-w-xl mx-auto py-12 px-4">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900/30 flex items-center justify-center mb-4 border border-purple-500/20">
                        <Sparkles className="text-[var(--primary)]" size={26} />
                    </div>
                    <h1 className="text-2xl font-bold text-fg">Chat with PDF</h1>
                    <p className="text-muted text-sm mt-1">Upload your document to start asking questions instantly.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleStartChat} className="rounded-2xl bg-card border border-card p-6 flex flex-col gap-6">
                    {!fileMeta ? (
                        <UploadCard
                            onFiles={handleFile}
                            title={"Drag & drop your PDF here"}
                            hint={"or click to browse files from your device"}
                        />
                    ) : (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center shrink-0">
                                <FileText size={18} className="text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-fg text-sm font-medium truncate">{fileMeta.name}</p>
                                <p className="text-muted text-xs">{fileMeta.size}</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => { setSelectedFile(null); setFileMeta(null); setError(null); }} 
                                className="text-muted hover:text-[var(--primary)] shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !selectedFile}
                        className="w-full py-3 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing PDF...
                            </>
                        ) : (
                            <>
                                Start Chatting
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[var(--primary)]" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-fg truncate">{fileMeta?.name}</h1>
                        <p className="text-muted text-xs">PDF Chat Session Active</p>
                    </div>
                </div>
                <button
                    onClick={() => { setStep("upload"); setSelectedFile(null); setFileMeta(null); setMessages([]); }}
                    className="text-xs text-muted hover:text-[var(--primary)] px-3 py-1.5 rounded-lg bg-card border border-card transition-colors"
                >
                    Change PDF
                </button>
            </div>

            {/* Chat Box Container */}
            <div className="flex-1 overflow-y-auto rounded-2xl bg-card border border-card p-4 space-y-4 mb-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                msg.role === "user"
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-purple-900/30 border border-purple-500/20 text-[var(--primary)]"
                            }`}
                        >
                            {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
                        </div>
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-[var(--primary)] text-white rounded-tr-none"
                                    : "bg-black/20 text-fg border border-white/5 rounded-tl-none"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-900/30 border border-purple-500/20 text-[var(--primary)] flex items-center justify-center shrink-0">
                            <Bot size={15} />
                        </div>
                        <div className="bg-black/20 text-muted border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse delay-150" />
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse delay-300" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about this document..."
                    className="flex-1 rounded-full bg-card border border-card px-5 py-3 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:opacity-90 transition-colors disabled:opacity-50 shrink-0 shadow-lg shadow-purple-900/20"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}