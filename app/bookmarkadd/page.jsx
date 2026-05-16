"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, Type, Save, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { getCurrentUser } from "../../lib/getUser";
import toast from "react-hot-toast";

const AddBookmark = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading,setLoading]=useState(false)



const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title || !url) {
    alert("Title and URL are required");
    return;
  }

  setLoading(true);

  try {
    // 1. Get logged in user
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("User not logged in");
    }

    // 2. Insert into Supabase
    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title,
          url,
          user_id: user.id,
        },
      ])
  

    if (error) {
      throw error;
    }

    // 3. Success
    console.log("Inserted:", data);
    toast.success("Bookmark added successfully")


    setTitle("");
    setUrl("");

    router.push("/auth/callback");
  } catch (err) {
    console.error("Submit error:", err.message);
    alert(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (Consistent with Dashboard) */}
      <Header />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Bookmark
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter the details of the website you want to save to your
              collection.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bookmark Title
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="e.g. React Documentation"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  A descriptive name for your bookmark.
                </p>
              </div>

              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Website URL
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="https://example.com"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  The full web address (e.g., https://...)
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
          
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 cursor-pointer text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save className="h-4 w-4" />
                {loading?"Loading...":" Save Bookmark"}
               
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default AddBookmark;
