"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import {
  Loader2, Save, Globe, Eye, EyeOff,
  Image as ImageIcon, Calendar, MapPin, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface Article {
  id:          string;
  title:       string;
  slug:        string;
  type:        string | null;
  excerpt:     string | null;
  content:     string | null;
  imageUrl:    string | null;
  eventDate:   Date | null;
  location:    string | null;
  isPublished: boolean;
}

interface Props {
  article?: Article | null;
}

// ── Validation ─────────────────────────────────────────────────────────────

const schema = z.object({
  title:       z.string().min(2, "Title is required"),
  type:        z.enum(["news", "event", "trade_mission"]),
  excerpt:     z.string().max(300, "Keep excerpt under 300 characters").optional(),
  content:     z.string().optional(),
  imageUrl:    z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  eventDate:   z.string().optional(),
  location:    z.string().optional(),
  isPublished: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

// ── Type options ───────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "news",          label: "News Article",  description: "General news, announcements, press releases" },
  { value: "event",         label: "Event",          description: "Trade shows, seminars, webinars" },
  { value: "trade_mission", label: "Trade Mission",  description: "Official trade and diplomatic missions" },
];

// ── Component ──────────────────────────────────────────────────────────────

export function NewsArticleForm({ article }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const isNew = !article;

  const [imagePreview, setImagePreview] = useState(article?.imageUrl ?? "");
  const [charCount, setCharCount]       = useState(article?.excerpt?.length ?? 0);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       article?.title       ?? "",
      type:        (article?.type as FormData["type"]) ?? "news",
      excerpt:     article?.excerpt     ?? "",
      content:     article?.content     ?? "",
      imageUrl:    article?.imageUrl    ?? "",
      eventDate:   article?.eventDate
        ? new Date(article.eventDate).toISOString().slice(0, 16)
        : "",
      location:    article?.location    ?? "",
      isPublished: article?.isPublished ?? false,
    },
  });

  const watchedType      = watch("type");
  const watchedPublished = watch("isPublished");

  async function onSubmit(data: FormData) {
    const body = {
      ...data,
      imageUrl:  data.imageUrl  || null,
      eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : null,
      location:  data.location  || null,
      excerpt:   data.excerpt   || null,
      content:   data.content   || null,
    };

    const endpoint = isNew
      ? "/api/admin/news"
      : `/api/admin/news/${article!.id}`;

    const res = await fetch(endpoint, {
      method:  isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (res.ok) {
      const json = await res.json();
      success(
        isNew ? "Article created" : "Article updated",
        data.isPublished ? "Published and live on the website." : "Saved as draft."
      );
      if (isNew) {
        router.push(`/admin/news/${json.id}`);
      } else {
        router.refresh();
      }
    } else {
      const json = await res.json();
      error("Save failed", json.error ?? "Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

      {/* ── Type selector ─────────────────────────────────── */}
      <div className="card p-6 space-y-3">
        <h2 className="font-display font-semibold text-base text-neutral-900">Article Type</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TYPE_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("type", value as FormData["type"], { shouldDirty: true })}
              className={cn(
                "text-left p-3.5 rounded-xl border transition-all",
                watchedType === value
                  ? "border-primary-500 bg-primary-50 shadow-sm"
                  : "border-border hover:border-primary-300 hover:bg-neutral-50"
              )}
            >
              <p className={cn(
                "text-sm font-semibold",
                watchedType === value ? "text-primary-800" : "text-neutral-700"
              )}>
                {label}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{description}</p>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("type")} />
      </div>

      {/* ── Core content ──────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display font-semibold text-base text-neutral-900">Content</h2>

        {/* Title */}
        <div>
          <label className="label">Title <span className="text-error">*</span></label>
          <input
            type="text"
            className={`input text-base font-medium ${errors.title ? "border-error" : ""}`}
            placeholder="e.g. Azuretti signs export agreement with French distributor"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-error">{errors.title.message}</p>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="label">
            Excerpt{" "}
            <span className="text-neutral-400 font-normal">(shown on listing pages)</span>
          </label>
          <textarea
            rows={2}
            className={`input resize-none ${errors.excerpt ? "border-error" : ""}`}
            placeholder="A one or two sentence summary that appears in cards and search results."
            {...register("excerpt", {
              onChange: (e) => setCharCount(e.target.value.length),
            })}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.excerpt ? (
              <p className="text-xs text-error">{errors.excerpt.message}</p>
            ) : <span />}
            <span className={cn(
              "text-xs",
              charCount > 280 ? "text-amber-500" : "text-neutral-400"
            )}>
              {charCount}/300
            </span>
          </div>
        </div>

        {/* Content — plain textarea; swap for a rich-text editor if desired */}
        <div>
          <label className="label">
            Full Content{" "}
            <span className="text-neutral-400 font-normal">(supports Markdown)</span>
          </label>
          <textarea
            rows={14}
            className="input resize-y font-mono text-sm"
            placeholder="Write the full article content here. Markdown is rendered on the website."
            {...register("content")}
          />
        </div>
      </div>

      {/* ── Media & Meta ──────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display font-semibold text-base text-neutral-900">Media & Metadata</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Image URL */}
          <div className="sm:col-span-2">
            <label className="label">
              Cover Image URL{" "}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                <input
                  type="url"
                  className={`input pl-9 ${errors.imageUrl ? "border-error" : ""}`}
                  placeholder="https://..."
                  {...register("imageUrl", {
                    onChange: (e) => setImagePreview(e.target.value),
                  })}
                />
              </div>
            </div>
            {errors.imageUrl && (
              <p className="mt-1.5 text-xs text-error">{errors.imageUrl.message}</p>
            )}
            {/* Image preview */}
            {imagePreview && (
              <div className="mt-2 rounded-xl overflow-hidden border border-border h-40 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          {/* Event date — only for events/trade missions */}
          {(watchedType === "event" || watchedType === "trade_mission") && (
            <div>
              <label className="label">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                className="input"
                {...register("eventDate")}
              />
            </div>
          )}

          {/* Location */}
          <div>
            <label className="label">
              <MapPin className="inline h-3.5 w-3.5 mr-1" />
              Location{" "}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Paris, France"
              {...register("location")}
            />
          </div>
        </div>
      </div>

      {/* ── Publish control ────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {watchedPublished ? (
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Globe className="h-4 w-4 text-green-600" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                <EyeOff className="h-4 w-4 text-neutral-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {watchedPublished ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-neutral-500">
                {watchedPublished
                  ? "Visible on the public website."
                  : "Not visible to the public yet."}
              </p>
            </div>
          </div>
          {/* Toggle */}
          <button
            type="button"
            onClick={() => setValue("isPublished", !watchedPublished, { shouldDirty: true })}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
              watchedPublished ? "bg-green-500" : "bg-neutral-200"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                watchedPublished ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* Save + preview actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-7 py-2.5 rounded bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting
            ? "Saving…"
            : isNew
            ? "Create Article"
            : "Save Changes"}
        </button>

        {!isNew && article?.isPublished && (
          <a
            href={`/news/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded border border-border text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View on website
          </a>
        )}

        <Link
          href="/admin/news"
          className="px-4 py-2.5 rounded border border-border text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}