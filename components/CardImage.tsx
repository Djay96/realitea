"use client";

import { useState } from "react";
import { topicPlaceholder } from "@/lib/extractImage";

export default function CardImage({
  imageUrl,
  topics,
  title,
}: {
  imageUrl?: string;
  topics?: string[];
  title: string;
}) {
  const [failed, setFailed] = useState(false);
  const topic = topics?.[0];
  const placeholder = topicPlaceholder(topic);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div className="relative h-2/5 w-full shrink-0 overflow-hidden bg-tea-100 dark:bg-neutral-800">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${placeholder.gradient} px-6 text-center`}
        >
          <span className="text-6xl drop-shadow-md">{placeholder.emoji}</span>
          <p className="mt-3 line-clamp-2 text-sm font-semibold text-white/90 drop-shadow">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
