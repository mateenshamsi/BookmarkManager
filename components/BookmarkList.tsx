"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import AddBookmarkForm from "./AddBookmarkForm";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
};

export default function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchBookmarks = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      return;
    }

    setBookmarks(data || []);
  };

  const handleRealtimeUpdate = (payload: any) => {
    console.log("Real-time update received:", payload);

    if (payload.eventType === "INSERT" && payload.new) {
      const newBookmark = payload.new as Bookmark;
      if (newBookmark.user_id !== userId) return;
      setBookmarks((prev) => {
        if (prev.find((b) => b.id === newBookmark.id)) return prev;
        return [newBookmark, ...prev];
      });
    } else if (payload.eventType === "DELETE" && payload.old) {
      const oldBookmark = payload.old as Bookmark;
      setBookmarks((prev) => prev.filter((b) => b.id !== oldBookmark.id));
    } else if (payload.eventType === "UPDATE" && payload.new) {
      const updatedBookmark = payload.new as Bookmark;
      setBookmarks((prev) =>
        prev.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b))
      );
    }
  };

  useEffect(() => {
    const initializeBookmarks = async () => {
      const supabase = createClient();

     
      await fetchBookmarks(userId);

      
      const channel = supabase
        .channel(`bookmarks:${userId}`)
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "bookmarks" },
          (payload) => {
            console.log("🔔 DELETE event received:", payload);
            handleRealtimeUpdate(payload);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("🔔 INSERT event received:", payload);
            handleRealtimeUpdate(payload);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("🔔 UPDATE event received:", payload);
            handleRealtimeUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      channelRef.current = channel;
      setLoading(false);
    };

    initializeBookmarks();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [userId]);

  const handleAdd = (bookmark: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.find((b) => b.id === bookmark.id)) return prev;
      return [bookmark, ...prev];
    });
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting bookmark:", error);
      return;
    }
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div>
        <AddBookmarkForm userId={userId} onAdd={handleAdd} />
        <div className="mt-8 text-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-sm">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AddBookmarkForm userId={userId} onAdd={handleAdd} />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Bookmarks
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {bookmarks.length} saved
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔖</div>
            <p className="text-lg font-medium">No bookmarks yet</p>
            <p className="text-sm mt-1">
              Add your first bookmark using the form above
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`}
                    alt=""
                    className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors block truncate"
                    >
                      {bookmark.title}
                    </a>
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {getDomain(bookmark.url)} · {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="text-red-500  p-1 rounded"
                  title="Delete bookmark"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}