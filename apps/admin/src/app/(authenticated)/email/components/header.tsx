import { Loader2, Mail, Send } from "lucide-react";

interface HeaderProps {
  recipientCount: number;
  sending: boolean;
  onSend: () => void;
}

export function Header({ recipientCount, sending, onSend }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 flex items-center justify-center">
          <Mail className="h-5 w-5 text-neutral-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Send Email</h1>
          <p className="text-sm text-neutral-500">
            Compose and send emails to participants
          </p>
        </div>
      </div>

      <button
        onClick={onSend}
        disabled={sending || recipientCount === 0}
        className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send to {recipientCount} recipient
        {recipientCount !== 1 ? "s" : ""}
      </button>
    </div>
  );
}
