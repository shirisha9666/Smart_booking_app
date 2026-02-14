"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";

import useAuthSync, {
  deleteBookmark,
  getUserBookmarks,
} from "../../../services/bookmarkService";
import { formatDate } from "../../../services/dateFormate";

const Dashboard = () => {
  useAuthSync();
  const router = useRouter();
  const channelRef = useRef();

  const [selectedItems, setSelectedItems] = useState([]);

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(null);

  const handleAdd = () => {
    router.push("/bookmarkadd");
  };

  const handleEditnavigation = (id) => {
    router.push(`/bookmarkUpdate/${id}`);
  };

  const loadBookmarks = async () => {
    try {
      const data = await getUserBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error("Fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      setDelLoading(id);
      await deleteBookmark(id);
      loadBookmarks();
    } catch (error) {
      console.error("Delete error:", error.message);
      alert("Failed to delete bookmark");
    } finally {
      setDelLoading(null);
    }
  };
  useEffect(() => {
    if (channelRef.current) return; // 🚫 prevent double subscribe

    const setupRealtime = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      const channel = supabase
        .channel("realtime-bookmarks")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookmarks" },
          (payload) => {
            console.log("Realtime triggered:", payload);
            loadBookmarks();
          },
        )
        .subscribe((status) => {
          console.log("Realtime status:", status);
        });

      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
            <p className="text-gray-500 mt-1">
              Manage and organize your favorite links
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="flex-1 cursor-pointer sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add New
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Total Bookmarks",
              value: bookmarks.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header / Filters */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-4 w-1/4">Title / Text</th>
                  <th className="px-6 py-4 w-1/3">Bookmark URL</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {loading ? (
                    <td>loading</td>
                  ) : (
                    bookmarks.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className={`hover:bg-gray-50 transition-colors ${selectedItems.includes(item.id) ? "bg-indigo-50/50" : ""}`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-indigo-600 truncate max-w-[200px]"
                          >
                            {item.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditnavigation(item.id)}
                              className="p-1.5 cursor-pointer  rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 cursor-pointer  rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              {delLoading === item.id ? (
                                "Loading...."
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
                {bookmarks.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No bookmarks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
