"use client";

import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upvoteProductAction, downvoteProductAction } from "@/lib/products/product-actions"; 

type VotingButtonsProps = {
  productId: number;
  voteCount?: number | null;
  userVote?: 1 | -1 | null;
  onError?: (message: string) => void;
};

export default function VotingButtons({
  productId,
  voteCount: initialVoteCount = 0,
  userVote: initialUserVote = null,
  onError,
}: VotingButtonsProps) {
  const [votes, setVotes] = useState(initialVoteCount ?? 0);
  const [currentUserVote, setCurrentUserVote] = useState(initialUserVote);
  const [isPending, setIsPending] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (isPending) return;
    setIsPending(true);

    try {
      const res =
        type === "up"
          ? await upvoteProductAction(productId)
          : await downvoteProductAction(productId);

          
      if (!res.success) {
        onError?.(res.message);
        return;
      }

      if (typeof res.voteCount === "number") {
        setVotes(res.voteCount);
      }
      setCurrentUserVote(res.userVote ?? null);
    } catch {
      onError?.("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center border rounded-lg p-1 bg-background shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`size-7 ${currentUserVote === 1 ? "text-primary" : ""}`}
        onClick={() => handleVote("up")}
        disabled={isPending}
      >
        <ChevronUpIcon className="size-4" />
      </Button>

      <span className="text-xs font-semibold px-1 min-w-[20px] text-center select-none">
        {votes}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`size-7 ${currentUserVote === -1 ? "text-primary" : ""}`}
        onClick={() => handleVote("down")}
        disabled={isPending}
      >
        <ChevronDownIcon className="size-4" />
      </Button>
    </div>
  );
}