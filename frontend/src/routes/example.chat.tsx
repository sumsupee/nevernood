import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "../demo.index.css";

// Type guards for message parts
interface TextPart {
  type: "text";
  text?: string;
}
function isTextPart(part: unknown): part is TextPart {
  return Boolean(part && (part as { type?: string }).type === "text");
}
// Removed guitar-specific tool part handling

// Basic image upload helper. Sends a data URL as a simple text message.
function PhotoButtons({
  sendMessage,
  hasUploaded,
  onUploaded,
}: {
  sendMessage?: (message: { text: string }) => void;
  hasUploaded?: boolean;
  onUploaded?: () => void;
}) {
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && sendMessage) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        sendMessage({ text: `Uploaded image: ${dataUrl}` });
        if (onUploaded) onUploaded();
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = "";
  };

  return (
    <div className="flex justify-center gap-2 mb-4">
      <button
        type="button"
        onClick={() => imgInputRef.current?.click()}
        className="px-4 py-2 rounded bg-white text-black font-medium hover:bg-gray-200"
      >
        Upload image
      </button>
      {hasUploaded ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded bg-white text-black font-medium hover:bg-gray-200"
        >
          Start over
        </button>
      ) : null}
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function InitialLayout({
  children,
  sendMessage,
  hasUploaded,
  onUploaded,
}: {
  children: React.ReactNode;
  sendMessage?: (message: { text: string }) => void;
  hasUploaded?: boolean;
  onUploaded?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-3xl mx-auto w-full">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text uppercase">
          <span className="text-white">Never</span> Nood
        </h1>
        <p className="text-gray-400 mb-6 w-2/3 mx-auto text-lg">Clothes. Recommended.</p>
        <PhotoButtons sendMessage={sendMessage} hasUploaded={hasUploaded} onUploaded={onUploaded} />
        {children}
      </div>
    </div>
  );
}

function ChattingLayout({
  children,
  sendMessage,
  hasUploaded,
  onUploaded,
}: {
  children: React.ReactNode;
  sendMessage?: (message: { text: string }) => void;
  hasUploaded?: boolean;
  onUploaded?: () => void;
}) {
  // sendMessage is passed to PhotoButtons when needed
  return (
    <div className="absolute bottom-0 right-0 left-64 bg-gray-900/80 backdrop-blur-sm border-t border-orange-500/10">
      <div className="max-w-3xl mx-auto w-full px-4 py-3">
        <PhotoButtons sendMessage={sendMessage} hasUploaded={hasUploaded} onUploaded={onUploaded} />
        {children}
      </div>
    </div>
  );
}

function Messages({ messages }: { messages: Array<UIMessage> }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when the number of messages changes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    // reference messages.length so the hook depends on it and re-runs
    void messages.length;
  }, [messages.length]);

  if (!messages.length) {
    return null;
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-3xl mx-auto w-full px-4">
        {messages.map(({ id, role, parts }) => (
          <div
            key={id}
            className={`p-4 ${role === "assistant" ? "bg-gradient-to-r from-orange-500/5 to-red-600/5" : "bg-transparent"}`}
          >
            <div className="flex items-start gap-4 max-w-3xl mx-auto w-full">
              {role === "assistant" ? (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 mt-2 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  TF
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                  Me
                </div>
              )}
              <div className="flex-1">
                {parts.map((part) => {
                  if (isTextPart(part)) {
                    const text = part.text ?? "";
                    const textKey = `${id}-text-${encodeURIComponent(text.slice(0, 40))}`;
                    const imageMatch = text.match(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/);
                    const imageSrc = imageMatch?.[0];
                    const cleanedText = imageSrc
                      ? text.replace(/Uploaded\s+image:\s*/i, "").replace(imageSrc, "").trim()
                      : text;
                    return (
                      <div className="flex-1 min-w-0" key={textKey}>
                        {cleanedText ? (
                          <ReactMarkdown
                            className="prose dark:prose-invert max-w-none"
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                          >
                            {cleanedText}
                          </ReactMarkdown>
                        ) : null}
                        {imageSrc ? (
                          <div className="mt-3">
                            <img
                              src={imageSrc}
                              alt="Uploaded outfit"
                              className="max-w-full h-auto rounded-lg border border-orange-500/20 shadow-md"
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  // Removed guitar-specific tool UI rendering

                  return null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPage() {
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/demo-chat" }),
  });

  const [input, setInput] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const Layout = messages.length ? ChattingLayout : InitialLayout;

  return (
    <div className="relative flex h-[calc(100vh-32px)] bg-gray-900">
      <div className="flex-1 flex flex-col">
        <Messages messages={messages} />
        <Layout
          sendMessage={sendMessage}
          hasUploaded={hasUploaded}
          onUploaded={() => setHasUploaded(true)}
        >
          {messages.length > 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                sendMessage({ text: input });
                setInput("");
              }}
            >
              <div className="relative max-w-xl mx-auto">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Suggest something else..."
                  className="w-full rounded-lg border border-orange-500/20 bg-gray-800/50 pl-4 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none overflow-hidden shadow-lg"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "200px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!input.trim()) return;
                      sendMessage({ text: input });
                      setInput("");
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : null}
        </Layout>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/example/chat")({
  component: ChatPage,
});
