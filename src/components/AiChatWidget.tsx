import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpen, Loader2, MessageCircle, Send, X } from "lucide-react";
type ChatRole = "user" | "assistant";
type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
};
type ChatResponse = {
    answer?: string;
    message?: string;
    usage?: {
        count: number;
        limit: number;
    };
};
const START_MESSAGE: ChatMessage = {
    id: "start",
    role: "assistant",
    content: "Ik beantwoord vragen op basis van de Jaakie-kennisbank.",
};
export function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([START_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [usageLabel, setUsageLabel] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (open) {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages, open]);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const question = input.trim();
        if (!question || loading)
            return;
        const userMessage = createMessage("user", question);
        setMessages((current) => [...current, userMessage]);
        setInput("");
        setLoading(true);
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: question,
                    history: messages.filter((message) => message.id !== START_MESSAGE.id).map(({ role, content }) => ({ role, content })),
                }),
            });
            const body = (await response.json()) as ChatResponse;
            const answer = response.ok
                ? body.answer ?? "Ik vind dit niet terug in de kennisbank."
                : body.message ?? "De AI-chat kon deze vraag niet verwerken.";
            setMessages((current) => [...current, createMessage("assistant", answer)]);
            if (body.usage)
                setUsageLabel(`${body.usage.count}/${body.usage.limit} vandaag`);
        }
        catch {
            setMessages((current) => [...current, createMessage("assistant", "De AI-chat is tijdelijk niet bereikbaar.")]);
        }
        finally {
            setLoading(false);
        }
    }
    return (<aside className="ai-chat" aria-label="Jaakie kennisbankchat">
      {open ? (<section className="ai-chat-panel" aria-live="polite">
          <header className="ai-chat-header">
            <div className="ai-chat-title">
              <BookOpen size={18} strokeWidth={2.2} aria-hidden="true"/>
              <span>Vraag aan Jaakie</span>
            </div>
            <button className="ai-chat-icon-button" type="button" onClick={() => setOpen(false)} aria-label="Sluit Jaakie chat">
              <X size={18} strokeWidth={2.2} aria-hidden="true"/>
            </button>
          </header>

          <div className="ai-chat-messages" ref={listRef}>
            {messages.map((message) => (<div className={`ai-chat-message ai-chat-message-${message.role}`} key={message.id}>
                {message.content}
              </div>))}
            {loading ? (<div className="ai-chat-message ai-chat-message-assistant ai-chat-loading">
                <Loader2 size={16} strokeWidth={2.2} aria-hidden="true"/>
                Bezig
              </div>) : null}
          </div>

          <form className="ai-chat-form" onSubmit={handleSubmit}>
            <textarea aria-label="Vraag voor Jaakie" maxLength={1000} onChange={(event) => setInput(event.target.value)} placeholder="Vraag over Jaakie of PC 200" rows={2} value={input}/>
            <button className="ai-chat-send" type="submit" disabled={loading || input.trim().length === 0} aria-label="Verstuur vraag">
              <Send size={17} strokeWidth={2.2} aria-hidden="true"/>
            </button>
          </form>

          {usageLabel ? <div className="ai-chat-usage">{usageLabel}</div> : null}
        </section>) : (<button className="ai-chat-launcher" type="button" onClick={() => setOpen(true)} aria-label="Open Jaakie chat">
          <MessageCircle size={18} strokeWidth={2.3} aria-hidden="true"/>
          <span>Vraag aan Jaakie</span>
        </button>)}
    </aside>);
}
function createMessage(role: ChatRole, content: string): ChatMessage {
    return {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role,
        content,
    };
}
