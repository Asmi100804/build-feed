"use client";

import { useState } from "react";
import VotingButtons from "@/components/ui/products/voting-buttons";
import { Badge } from "@/components/ui/badge";
import { AlertCircleIcon } from "lucide-react";

type ProductSupportCardProps = {
  productId: number;
  userVote?: 1 | -1 | null;
  voteCount?: number | null;
};

export default function ProductSupportCard({
  productId,
  userVote,
  voteCount = 0,
}: ProductSupportCardProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, 3500);
  };

  return (
    <div className="w-full">
      {/* 🔴 VOTING CARD KE THEEK UPAR WARNING BLOCK */}
      {errorMessage && (
        <div className="mb-2 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium py-2 px-3 flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 shrink-0 ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Support / Voting Box */}
      <div className="border rounded-lg p-6 bg-background">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Support this product
          </p>
          <div className="flex justify-center">
            <VotingButtons
              productId={productId}
              userVote={userVote}
              voteCount={voteCount}
              onError={handleError}
            />
          </div>
        </div>

        {(voteCount ?? 0) > 100 && (
          <div className="pt-6 border-t">
            <Badge className="w-full justify-center py-2">
              ⭐ Featured Product
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}