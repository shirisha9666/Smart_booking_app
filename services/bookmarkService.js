import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "../lib/getUser";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export async function getUserBookmarks() {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function deleteBookmark(bookmarkId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", user.id);

  if (error) throw error;

  return true;
}

export async function getBookmarkById(bookmarkId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("id", bookmarkId)
    .eq("user_id", user.id) // extra safety
    .single();

  if (error) throw error;

  return data;
}

export default function useAuthSync() {
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);

        if (event === "SIGNED_OUT") {
          router.push("/"); // redirect to login
        }
        if (event === "SIGNED_IN" && session) {
          router.replace("/auth/callback");
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);
}


// export default function useAuthSync() {
//   const router = useRouter();

//   useEffect(() => {
//     // 1️⃣ Listen Supabase auth events (same tab)
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         console.log("Auth event:", event);

//         if (event === "SIGNED_OUT") {
//           router.replace("/");
//         }

//         if (event === "SIGNED_IN" && session) {
//           router.replace("/auth/callback");
//         }
//       }
//     );

//     // 2️⃣ Listen cross-tab login via localStorage change
//     const handleStorageChange = async () => {
//       const { data } = await supabase.auth.getSession();

//       if (data?.session) {
//         router.replace("/auth/callback");   // user logged in another tab
//       } else {
//         router.replace("/");                // user logged out another tab
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       listener.subscription.unsubscribe();
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, [router]);
// }
