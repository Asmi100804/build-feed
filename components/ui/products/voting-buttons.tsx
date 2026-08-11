"use client";
import {
  downvoteProductAction,
  upvoteProductAction,
} from "@/lib/products/product-actions";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";

type UserVote = 1 | -1 | null;

type OptimisticVoteState = {
  voteCount: number;
  userVote: UserVote;
};

const getNextVoteState = (
  currentState: OptimisticVoteState,
  selectedVote: Exclude<UserVote, null>
): OptimisticVoteState => {
  const nextUserVote =
    currentState.userVote === selectedVote ? null : selectedVote;

  return {
    userVote: nextUserVote,
    voteCount:
      currentState.voteCount -
      (currentState.userVote ?? 0) +
      (nextUserVote ?? 0),
  };
};

export default function VotingButtons({
  userVote,
  voteCount: initialVoteCount,
  productId,
}: {
  userVote: UserVote;
  voteCount: number;
  productId: number;
}) {
  const [optimisticVoteState, setOptimisticVoteState] = useOptimistic(
    { voteCount: initialVoteCount, userVote },
    getNextVoteState
  );

  const [isPending, startTransition] = useTransition();

  const handleVote = (selectedVote: Exclude<UserVote, null>) => {
    startTransition(async () => {
      setOptimisticVoteState(selectedVote);
      const result =
        selectedVote === 1
          ? await upvoteProductAction(productId)
          : await downvoteProductAction(productId);

      if (!result.success) {
        console.error(result.message);
      }
    });
  };

  return (
    <div
      className="flex flex-col items-center gap-1 shrink-0"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Button
        onClick={() => handleVote(1)}
        variant="ghost"
        size="icon-sm"
        className={cn(
          "h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary",
          optimisticVoteState.userVote === 1 &&
            "bg-primary/10 text-primary hover:bg-primary/20"
        )}
        disabled={isPending}
        aria-pressed={optimisticVoteState.userVote === 1}
        aria-label="Upvote product"
      >
        <ChevronUpIcon className="size-5" />
      </Button>
      <span className="text-sm font-semibold transition-colors text-foreground">
        {optimisticVoteState.voteCount}
      </span>
      <Button
        onClick={() => handleVote(-1)}
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        className={cn(
          "h-8 w-8 text-primary hover:bg-destructive/10 hover:text-destructive",
          optimisticVoteState.userVote === -1 &&
            "bg-destructive/10 text-destructive hover:bg-destructive/20"
        )}
        aria-pressed={optimisticVoteState.userVote === -1}
        aria-label="Downvote product"
      >
        <ChevronDownIcon className="size-5" />
      </Button>
    </div>
  );
}
