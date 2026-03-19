import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  shareUrl: string;
  summary: string;
}

type CopyState = "idle" | "link" | "summary";

export function ShareButtons({ shareUrl, summary }: ShareButtonsProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const copyToClipboard = async (type: CopyState, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState(type);
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <section className="panel share-panel">
      <h2>5. Partage et export</h2>
      <div className="share-buttons">
        <button type="button" onClick={() => copyToClipboard("link", shareUrl)}>
          {copyState === "link" ? <Check size={16} /> : <Link2 size={16} />}
          Copier le lien
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard("summary", summary)}
        >
          {copyState === "summary" ? <Check size={16} /> : <Copy size={16} />}
          Copier le resume
        </button>
      </div>
      <p className="hint">
        Le resume est copie au format Markdown pour le partager dans Slack,
        Notion ou email.
      </p>
    </section>
  );
}
