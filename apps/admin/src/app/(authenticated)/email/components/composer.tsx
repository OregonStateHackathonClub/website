"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getEmailRecipients,
  getNonApplicantEmails,
  sendEmail,
} from "@/app/actions/email";
import { Controls } from "./controls";
import { Editor } from "./editor";
import { Header } from "./header";
import type { Hackathon } from "./types";
import { DEFAULT_HTML } from "./types";

interface ComposerProps {
  hackathons: Hackathon[];
}

export function Composer({ hackathons }: ComposerProps) {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(
    null,
  );
  const [audienceFilter, setAudienceFilter] = useState<string>("NOT_APPLIED");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [recipients, setRecipients] = useState<
    { email: string; name: string; status: string }[]
  >([]);
  const [nonApplicants, setNonApplicants] = useState<
    { email: string; name: string }[]
  >([]);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [showPreview, setShowPreview] = useState(true);
  const [sending, setSending] = useState(false);

  const isNotApplied = audienceFilter === "NOT_APPLIED";

  useEffect(() => {
    async function loadRecipients() {
      if (!selectedHackathon || isNotApplied) return;
      try {
        const data = await getEmailRecipients(selectedHackathon.id);
        setRecipients(data);
      } catch {
        toast.error("Failed to load recipients");
      }
    }
    loadRecipients();
  }, [selectedHackathon, isNotApplied]);

  useEffect(() => {
    async function loadNonApplicants() {
      if (!isNotApplied) return;
      try {
        // For "Not Applied", we need a hackathon to compare against.
        // Use the most recent one (first in list).
        const hackathonId = hackathons[0]?.id;
        if (!hackathonId) return;
        const data = await getNonApplicantEmails(hackathonId);
        setNonApplicants(data);
      } catch {
        toast.error("Failed to load non-applicants");
      }
    }
    loadNonApplicants();
  }, [isNotApplied, hackathons]);

  const filteredRecipients = isNotApplied
    ? nonApplicants.map((u) => ({ ...u, status: "NOT_APPLIED" as const }))
    : statusFilter === "ALL"
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
          `Sent ${result.sentCount} emails, ${result.errors.length} failed`,
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
      <Header
        recipientCount={filteredRecipients.length}
        sending={sending}
        onSend={handleSend}
      />

      <Controls
        hackathons={hackathons}
        selectedHackathon={selectedHackathon}
        onHackathonChange={setSelectedHackathon}
        audienceFilter={audienceFilter}
        onAudienceFilterChange={(value) => {
          setAudienceFilter(value);
          if (value !== "NOT_APPLIED") {
            setStatusFilter("ALL");
          }
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showPreview={showPreview}
        onShowPreviewChange={setShowPreview}
      />

      <Editor
        subject={subject}
        onSubjectChange={setSubject}
        html={html}
        onHtmlChange={setHtml}
        showPreview={showPreview}
      />
    </div>
  );
}
