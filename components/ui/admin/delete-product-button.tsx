"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "../button";
import { deleteProductAction } from "@/lib/admin/admin-actions";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${productName}"? This will also remove all its votes and cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.success) setError(result.message);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={isPending}
        className="text-destructive hover:text-destructive hover:cursor-pointer"
      >
        <Trash2Icon className="size-4" />
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}