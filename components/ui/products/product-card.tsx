"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarIcon, AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../badge";
import VotingButtons from "./voting-buttons";
import { ProductType } from "@/types";

export default function ProductCard({ product }: { product: ProductType }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, 3500);
  };

  return (
    <div className="flex flex-col w-full">
      {errorMessage && (
        <div className="mb-2 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium py-2 px-3 flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 shrink-0 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <Link href={`/products/${product.slug}`} className="block">
        <Card className="group card-hover hover:bg-primary-foreground/10 border-solid border-gray-400 min-h-50">
          <CardHeader className="flex-1">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                  {(product.voteCount ?? 0) > 100 && (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <StarIcon className="size-3 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2 mt-1">
                  {product.description}
                </CardDescription>
              </div>

              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <VotingButtons
                  userVote={product.userVote}
                  voteCount={product.voteCount}
                  productId={product.id}
                  onError={handleError}
                />
              </div>
            </div>
          </CardHeader>

          <CardFooter>
            <div className="flex items-center gap-2 flex-wrap">
              {product.tags?.map((tag) => (
                <Badge variant="secondary" key={tag}>
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}