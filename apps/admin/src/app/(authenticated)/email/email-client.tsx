"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Send,
  Eye,
  Code,
  Users,
  ChevronDown,
  Check,
  Loader2,
  Mail,
} from "lucide-react";
import { sendEmail, getEmailRecipients } from "@/app/actions/email";
import type { ApplicationStatus } from "@repo/database";

type Hackathon = {
  id: string;
  name: string;
  _count: {
    applications: number;
  };
};

type Recipient = {
  email: string;
  name: string;
  status: ApplicationStatus;
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Recipients" },
  { value: "APPLIED", label: "Applied" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "CHECKED_IN", label: "Checked In" },
] as const;

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BeaverHacks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">BeaverHacks</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">Hello!</h2>

              <p style="margin: 0 0 16px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                This is your email content. Write your message here.
              </p>

              <p style="margin: 0 0 24px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                You can customize this template with your own HTML.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #000000; border-radius: 6px;">
                    <a href="https://beaverhacks.org" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                      Visit BeaverHacks
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 12px;">
                Oregon State University Hackathon Club
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                <a href="https://beaverhacks.org" style="color: #666666;">beaverhacks.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function EmailClient({ hackathons }: { hackathons: Hackathon[] }) {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    hackathons[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [showPreview, setShowPreview] = useState(true);
  const [sending, setSending] = useState(false);
  const [hackathonOpen, setHackathonOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function loadRecipients() {
      if (!selectedHackathon) return;
      try {
        const data = await getEmailRecipients(selectedHackathon.id);
        setRecipients(data);
      } catch {
        toast.error("Failed to load recipients");
      }
    }
    loadRecipients();
  }, [selectedHackathon]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html, showPreview]);

  const filteredRecipients =
    statusFilter === "ALL"
      ? recipients
      : recipients.filter((r) => r.status === statusFilter);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (filteredRecipients.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    setSending(true);
    try {
      const result = await sendEmail({
        to: filteredRecipients.map((r) => r.email),
        subject,
        html,
      });

      if (result.success) {
        toast.success(`Successfully sent ${result.sentCount} emails`);
      } else {
        toast.warning(
          `Sent ${result.sentCount} emails, ${result.errors.length} failed`
        );
        console.error("Email errors:", result.errors);
      }
    } catch {
      toast.error("Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6 overflow-hidden">
      {/* Header */}
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
          onClick={handleSend}
          disabled={sending || filteredRecipients.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send to {filteredRecipients.length} recipient
          {filteredRecipients.length !== 1 ? "s" : ""}
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-neutral-800 bg-neutral-950/50">
        {/* Hackathon Selector */}
        <div className="relative">
          <button
            onClick={() => setHackathonOpen(!hackathonOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-neutral-700 bg-neutral-900 text-sm text-white min-w-[200px] justify-between"
          >
            <span>
              {selectedHackathon
                ? selectedHackathon.name
                : "Select Hackathon"}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>

          {hackathonOpen && (
            <div className="absolute z-10 mt-1 w-max min-w-full bg-neutral-900 border border-neutral-700 shadow-lg">
              {hackathons.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setSelectedHackathon(h);
                    setHackathonOpen(false);
                  }}
                  className="flex items-center gap-4 w-full px-3 py-2 text-sm text-left text-white hover:bg-neutral-800 whitespace-nowrap"
                >
                  <span>{h.name}</span>
                  <span className="text-neutral-500 ml-auto">
                    {h._count.applications}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-neutral-700 bg-neutral-900 text-sm text-white min-w-[160px] justify-between"
          >
            <Users className="h-4 w-4 text-neutral-500" />
            <span>
              {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>

          {statusOpen && (
            <div className="absolute z-10 mt-1 w-full bg-neutral-900 border border-neutral-700 shadow-lg">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setStatusOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-left text-white hover:bg-neutral-800"
                >
                  <span>{option.label}</span>
                  {statusFilter === option.value && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Preview Toggle */}
        <div className="flex items-center border border-neutral-700">
          <button
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              !showPreview
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            <Code className="h-4 w-4" />
            Code
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              showPreview
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Subject Line */}
      <div className="px-6 py-3 border-b border-neutral-800">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject..."
          className="w-full bg-transparent text-white text-lg font-medium placeholder:text-neutral-600 focus:outline-none"
        />
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 flex min-h-0">
        {/* HTML Editor */}
        <div
          className={`${showPreview ? "w-1/2" : "w-full"} min-h-0 border-r border-neutral-800`}
        >
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full h-full p-4 bg-neutral-900/30 text-neutral-300 text-sm font-mono resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 min-h-0 bg-neutral-100 overflow-auto">
            <iframe
              ref={iframeRef}
              title="Email Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
