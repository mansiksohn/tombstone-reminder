'use client';

import { useState } from 'react';

export default function PromptCard({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드가 막힌 환경에서는 직접 긁어서 복사하면 된다.
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <blockquote className="prompt-card">{prompt}</blockquote>
      <button onClick={copy} className="rounded-lg">
        {copied ? '복사됐습니다' : '질문 복사하기'}
      </button>
    </div>
  );
}
