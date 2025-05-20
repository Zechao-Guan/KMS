import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Paper = {
  id: number;
  title: string;
  link: string;
  note: string;
  status: "unread" | "read";
  created_at: string;
};

type NewPaper = {
  title: string;
  link: string;
  note: string;
};

export default function Papers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPaper, setNewPaper] = useState<NewPaper>({ title: "", link: "", note: "" });
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [showForm, setShowForm] = useState(false);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setPapers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const addPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    const { error } = await supabase.from("papers").insert([
      { ...newPaper, status: "unread" },
    ]);
    if (error) setError(error.message);
    setNewPaper({ title: "", link: "", note: "" });
    setShowForm(false);
    setAdding(false);
    fetchPapers();
  };

  const toggleStatus = async (id: number, currentStatus: "unread" | "read") => {
    setLoading(true);
    setError(null);
    const newStatus = currentStatus === "read" ? "unread" : "read";
    const { error } = await supabase
      .from("papers")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) setError(error.message);
    fetchPapers();
  };

  // 过滤论文列表
  const filteredPapers = papers.filter(paper => {
    // 先按状态筛选
    if (filter !== "all" && paper.status !== filter) {
      return false;
    }
    // 再按搜索关键词筛选
    if (searchQuery) {
      return paper.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Papers
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Track and manage your research papers with ease.
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* 左侧表单 */}
            <div className="w-full md:w-1/3">
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 dark:border-white/10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Add New Paper
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <Input
                      type="text"
                      value={newPaper.title}
                      onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                      className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Paper title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link
                    </label>
                    <Input
                      type="text"
                      value={newPaper.link}
                      onChange={(e) => setNewPaper({ ...newPaper, link: e.target.value })}
                      className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Paper link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Note
                    </label>
                    <Input
                      type="text"
                      value={newPaper.note}
                      onChange={(e) => setNewPaper({ ...newPaper, note: e.target.value })}
                      className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Your notes"
                    />
                  </div>
                  <button
                    onClick={addPaper}
                    className="w-full rounded-full bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222]
                             text-black dark:text-white px-6 py-2 shadow-lg hover:scale-105 transition-transform
                             font-medium"
                  >
                    Add Paper
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧列表 */}
            <div className="w-full md:w-2/3">
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 dark:border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                    placeholder="Search papers..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all
                        ${filter === 'all' 
                          ? 'bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222] text-black dark:text-white shadow-lg' 
                          : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('read')}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all
                        ${filter === 'read' 
                          ? 'bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222] text-black dark:text-white shadow-lg' 
                          : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'}`}
                    >
                      Read
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all
                        ${filter === 'unread' 
                          ? 'bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222] text-black dark:text-white shadow-lg' 
                          : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'}`}
                    >
                      Unread
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                  <div className="space-y-4">
                    {filteredPapers.map((paper) => (
                      <div
                        key={paper.id}
                        className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30 dark:border-white/10
                                 hover:scale-[1.02] transition-transform cursor-pointer"
                        onClick={() => toggleStatus(paper.id, paper.status)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                              {paper.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {paper.note}
                            </p>
                            <a
                              href={paper.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Paper
                            </a>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium
                              ${paper.status === "read"
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}
                          >
                            {paper.status === "read" ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 