"use client";

import { Bot, LoaderCircle, Send } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_CHAT_MESSAGES = 20;

interface ChatMessage {
  content: string;
  id: string;
  role: "assistant" | "user";
}

interface AIChatProps {
  code: string;
  language: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function readError(responseBody: unknown): string | null {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "error" in responseBody &&
    typeof responseBody.error === "string"
  ) {
    return responseBody.error;
  }
  return null;
}

function readAssistantMessage(responseBody: unknown): string | null {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "message" in responseBody &&
    typeof responseBody.message === "string"
  ) {
    return responseBody.message;
  }
  return null;
}

export function AIChat({ code, language, onOpenChange, open }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messageId = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 || error) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || isLoading) {
      return;
    }

    const nextMessages = [
      ...messages,
      {
        id: `message-${messageId.current++}`,
        role: "user" as const,
        content,
      },
    ].slice(-MAX_CHAT_MESSAGES);
    setMessages(nextMessages);
    setPrompt("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });
      const responseBody: unknown = await response.json();
      const responseError = readError(responseBody);

      if (!response.ok) {
        throw new Error(responseError ?? "The AI request failed.");
      }

      const answer = readAssistantMessage(responseBody);
      if (!answer) {
        throw new Error("The AI returned an empty response.");
      }
      setMessages([
        ...nextMessages,
        {
          id: `message-${messageId.current++}`,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to contact the AI service."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        aria-describedby="ai-chat-description"
        className="flex w-[min(440px,100vw)] flex-col gap-0 p-0 sm:max-w-md"
        side="right"
      >
        <SheetHeader className="border-border border-b px-4 py-3 pr-12">
          <div className="flex items-center gap-2">
            <Bot aria-hidden="true" className="size-4 text-orange-300" />
            <SheetTitle className="text-sm">AI coding assistant</SheetTitle>
            <span className="ml-auto text-muted-foreground text-xs">
              Ollama
            </span>
          </div>
          <SheetDescription id="ai-chat-description">
            Ask about the current code in your editor.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div aria-live="polite" className="space-y-3 p-3">
            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                The latest editor contents are included with each message.
              </p>
            )}
            {messages.map((message) => (
              <div
                className={cn(
                  "max-w-[95%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-orange-500/15 text-foreground"
                    : "bg-muted text-foreground"
                )}
                key={message.id}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <output
                aria-label="AI is responding"
                className="flex items-center gap-2 text-muted-foreground text-sm"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
                Thinking…
              </output>
            )}
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-destructive text-sm">
                {error}
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form
          className="flex shrink-0 items-end gap-2 border-border border-t p-3"
          onSubmit={handleSubmit}
        >
          <Textarea
            aria-label="Message the AI assistant"
            className="min-h-10 resize-none"
            maxLength={4000}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask about your code..."
            value={prompt}
          />
          <Button
            aria-label="Send message"
            className="size-10 shrink-0 bg-orange-500 text-white hover:bg-orange-600"
            disabled={isLoading || !prompt.trim()}
            size="icon"
            type="submit"
          >
            <Send aria-hidden="true" className="size-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
