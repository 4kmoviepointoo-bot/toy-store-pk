"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, Check, AlertCircle, MessageSquare, ThumbsUp } from "lucide-react";

interface SerializedReview {
  _id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<SerializedReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ productId: slug, averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews || []);
        setSummary(data.data.summary || { productId: slug, averageRating: 0, totalReviews: 0 });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || rating < 1) {
      setError("Please fill in all fields and select a rating.");
      return;
    }

    const previousReviews = reviews;
    const previousSummary = summary;
    const optimisticReview: SerializedReview = {
      _id: `temp-${Date.now()}`,
      productId: slug,
      customerName: name.trim(),
      rating,
      comment: comment.trim(),
      verifiedPurchase: false,
      createdAt: new Date().toISOString(),
    };
    const newTotal = summary.totalReviews + 1;
    const newAvg = (summary.averageRating * summary.totalReviews + rating) / newTotal;

    setReviews((prev) => [optimisticReview, ...prev]);
    setSummary({ ...summary, averageRating: Math.round(newAvg * 10) / 10, totalReviews: newTotal });
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setName("");
    setRating(0);
    setComment("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: slug,
          customerName: optimisticReview.customerName,
          rating,
          comment: optimisticReview.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review");
      }
      fetchReviews();
    } catch (err) {
      setReviews(previousReviews);
      setSummary(previousSummary);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fullStars = Math.floor(summary.averageRating);
  const hasHalf = summary.averageRating % 1 >= 0.5;

  const ratingDistribution = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  return (
    <section className="mt-12 sm:mt-16 lg:mt-20">
      {/* Section Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
          <MessageSquare className="h-5 w-5 text-brand" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
            Customer Reviews
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""} for this product
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
        {/* Left — Ratings Overview + Write Review */}
        <div className="space-y-6">
          {/* Ratings Overview Card */}
          <div className="rounded-2xl bg-[#0e2f2b] border border-[#174942] p-6">
            <div className="flex items-center gap-6 mb-6">
              {/* Average Rating */}
              <div className="text-center">
                <p className="text-4xl font-extrabold text-text-primary">{summary.averageRating || "0.0"}</p>
                <div className="flex items-center gap-0.5 mt-1" aria-label={`${summary.averageRating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < fullStars
                          ? "text-[#f3cc3b] fill-[#f3cc3b]"
                          : i === fullStars && hasHalf
                          ? "text-[#f3cc3b] fill-[#f3cc3b]/50"
                          : "text-text-muted fill-text-muted/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-1">{summary.totalReviews} reviews</p>
              </div>

              {/* Rating Distribution Bars */}
              <div className="flex-1 space-y-2">
                {ratingDistribution.map((d) => (
                  <div key={d.stars} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-3 text-right">{d.stars}</span>
                    <Star className="h-3 w-3 text-[#f3cc3b] fill-[#f3cc3b] shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-[#174942] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#f3cc3b] transition-all duration-500"
                        style={{ width: `${(d.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted w-6 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a Review */}
            <div className="border-t border-[#174942] pt-6">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-brand" />
                Write a Review
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Your Rating *</label>
                  <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHoveredStar(s)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setRating(s)}
                        className="p-0.5 transition-transform duration-150 hover:scale-110 active:scale-95"
                        aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors duration-150 ${
                            s <= (hoveredStar || rating)
                              ? "text-[#f3cc3b] fill-[#f3cc3b]"
                              : "text-[#174942] fill-transparent"
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm font-semibold text-[#f3cc3b]">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="reviewer-name" className="block text-xs font-bold text-text-secondary mb-1.5">
                    Your Name *
                  </label>
                  <input
                    id="reviewer-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-[#174942] bg-[#0b2420] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="review-comment" className="block text-xs font-bold text-text-secondary mb-1.5">
                    Your Review *
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Tell others what you think about this product..."
                    className="w-full rounded-xl border border-[#174942] bg-[#0b2420] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {error}
                  </p>
                )}

                {success && (
                  <p className="text-xs text-green flex items-center gap-1">
                    <Check className="h-3 w-3 shrink-0" />
                    Review submitted successfully!
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !comment.trim() || rating < 1}
                  className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Review"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right — Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl bg-[#0e2f2b] border border-[#174942] p-8 text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15">
                  <MessageSquare className="h-6 w-6 text-brand" />
                </div>
              </div>
              <p className="text-sm font-bold text-text-primary mb-1">No reviews yet</p>
              <p className="text-xs text-text-muted">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const reviewFullStars = Math.floor(review.rating);
                const reviewHasHalf = review.rating % 1 >= 0.5;
                const date = new Date(review.createdAt);
                const formattedDate = date.toLocaleDateString("en-PK", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={review._id}
                    className="rounded-2xl bg-[#0e2f2b] border border-[#174942] p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 text-brand text-sm font-bold shrink-0">
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">{review.customerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < reviewFullStars
                                      ? "text-[#f3cc3b] fill-[#f3cc3b]"
                                      : i === reviewFullStars && reviewHasHalf
                                      ? "text-[#f3cc3b] fill-[#f3cc3b]/50"
                                      : "text-text-muted fill-text-muted/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-text-muted">{formattedDate}</span>
                        {review.verifiedPurchase && (
                          <span className="block mt-1 inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[9px] font-bold text-brand border border-brand/20">
                            <Check className="h-2.5 w-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
