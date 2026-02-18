import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarkList from "@/components/BookmarkList";
import SignOutButton from "@/components/SignOutButton";
import Image from "next/image";
import {User} from 'lucide-react'
export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔖</span>
            <h1 className="text-xl font-bold text-gray-900">
              Bookmark Manager
            </h1>
          </div>
          <div className="flex items-center gap-3">
        {user.user_metadata?.avatar_url ? (
  <Image
    src={user.user_metadata.avatar_url}
    alt="avatar"
    width={32}
    height={32}
    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
  />
) : (
  <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-200 flex items-center justify-center">
    <User className="w-4 h-4 text-gray-600" />
  </div>
)}

 <span className="text-sm text-gray-600 hidden sm:block">
    {user.user_metadata.full_name || user.email}
  </span>

  <SignOutButton />

        </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <BookmarkList initialBookmarks={bookmarks ?? []} userId={user.id} />
      </main>
    </div>
  );
}

