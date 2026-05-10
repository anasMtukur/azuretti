import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import { newsEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewsArticleForm } from "@/components/admin/NewsArticleForm";

export const metadata: Metadata = { title: "Article Editor – Admin" };

interface Props {
  params: { id: string };
}

export default async function AdminNewsEditorPage({ params }: Props) {
  await requireRole(["admin"]);

  const isNew = params.id === "new";

  let article = null;
  if (!isNew) {
    const [found] = await db
      .select()
      .from(newsEvents)
      .where(eq(newsEvents.id, params.id))
      .limit(1);
    if (!found) notFound();
    article = found;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to News & Events
      </Link>

      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          {isNew ? "New Article" : "Edit Article"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {isNew
            ? "Create a news article, event announcement or trade mission update."
            : `Editing: ${article!.title}`}
        </p>
      </div>

      <NewsArticleForm article={article} />
    </div>
  );
}