import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, X, Check } from "lucide-react";

type Paper = {
  id: number;
  title: string;
  link: string;
  note: string;
  status: "unread" | "read";
  tags: string[];
  created_at: string;
};

type NewPaper = {
  title: string;
  link: string;
  note: string;
  tags: string[];
};

export default function Papers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPaper, setNewPaper] = useState<NewPaper>({ title: "", link: "", note: "", tags: [] });
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editForm, setEditForm] = useState<NewPaper>({ title: "", link: "", note: "", tags: [] });

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    papers.forEach(paper => {
      paper.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [papers]);

  // 统计数据
  const stats = useMemo(() => {
    return {
      total: papers.length,
      read: papers.filter(p => p.status === "read").length,
      unread: papers.filter(p => p.status === "unread").length,
    };
  }, [papers]);

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
    setNewPaper({ title: "", link: "", note: "", tags: [] });
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
  const filteredPapers = useMemo(() => {
    return papers.filter(paper => {
      // 按状态筛选
      if (filter !== "all" && paper.status !== filter) {
        return false;
      }
      // 按标签筛选
      if (selectedTag && (!paper.tags || !paper.tags.includes(selectedTag))) {
        return false;
      }
      // 按搜索关键词筛选
      if (searchQuery) {
        return paper.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [papers, filter, selectedTag, searchQuery]);

  const startEditing = (paper: Paper) => {
    setEditingPaper(paper);
    setEditForm({
      title: paper.title,
      link: paper.link,
      note: paper.note,
      tags: paper.tags || [],
    });
  };

  const cancelEditing = () => {
    setEditingPaper(null);
    setEditForm({ title: "", link: "", note: "", tags: [] });
  };

  const updatePaper = async () => {
    if (!editingPaper) return;
    
    setLoading(true);
    setError(null);
    
    // 确保标签是字符串数组
    const tags = editForm.tags.filter(tag => tag.trim() !== '');
    
    const { error } = await supabase
      .from("papers")
      .update({
        ...editForm,
        tags: tags, // 确保更新标签字段
        updated_at: new Date().toISOString() // 添加更新时间
      })
      .eq("id", editingPaper.id);
    
    if (error) {
      setError(error.message);
      console.error('Error updating paper:', error);
    } else {
      // 更新成功后刷新数据
      await fetchPapers();
      setEditingPaper(null);
      setEditForm({ title: "", link: "", note: "", tags: [] });
    }
    
    setLoading(false);
  };

  const deletePaper = async (id: number) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;
    
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("papers")
      .delete()
      .eq("id", id);
    
    if (error) setError(error.message);
    fetchPapers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#ffffff] dark:from-[#111] dark:to-[#222]">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Papers
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Track and manage your research papers with ease
          </p>

          {/* 统计信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:max-w-3xl mx-auto bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-md p-6 mb-8"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Papers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.read}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {stats.unread}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
              </div>
            </div>
          </motion.div>

          {/* 标签筛选区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {allTags.length > 0 ? (
              allTags.map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-[#444] dark:to-[#222] 
                    text-black dark:text-white px-4 py-1.5 text-sm shadow hover:shadow-md transition-all duration-200
                    ${selectedTag === tag 
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg scale-105' 
                      : 'hover:scale-105'}`}
                >
                  <span className="flex items-center gap-1.5">
                    {tag}
                    {selectedTag === tag && (
                      <span className="text-xs bg-blue-500 dark:bg-blue-400 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        ×
                      </span>
                    )}
                  </span>
                </motion.button>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                No tags available
              </div>
            )}
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* 左侧表单 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full md:w-1/3"
            >
              <Card className="rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-xl p-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
                    Add New Paper
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      <Textarea
                        value={newPaper.note}
                        onChange={(e) => setNewPaper({ ...newPaper, note: e.target.value })}
                        className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                        placeholder="Your notes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags (comma separated)
                      </label>
                      <Input
                        type="text"
                        value={newPaper.tags.join(", ")}
                        onChange={(e) => setNewPaper({ ...newPaper, tags: e.target.value.split(",").map(t => t.trim()) })}
                        className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                        placeholder="CV, NLP, Transformer"
                      />
                    </div>
                    <Button
                      onClick={addPaper}
                      className="w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#444] dark:to-[#222] text-black dark:text-white px-6 py-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
                      disabled={adding}
                    >
                      {adding ? "Adding..." : "Add Paper"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 右侧列表 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full md:w-2/3"
            >
              <Card className="rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-xl p-6">
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-64 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Search papers..."
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setFilter('all')}
                        variant={filter === 'all' ? 'default' : 'ghost'}
                        className="rounded-full"
                      >
                        All
                      </Button>
                      <Button
                        onClick={() => setFilter('read')}
                        variant={filter === 'read' ? 'default' : 'ghost'}
                        className="rounded-full"
                      >
                        Read
                      </Button>
                      <Button
                        onClick={() => setFilter('unread')}
                        variant={filter === 'unread' ? 'default' : 'ghost'}
                        className="rounded-full"
                      >
                        Unread
                      </Button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                  ) : filteredPapers.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      {selectedTag 
                        ? `No papers found with tag "${selectedTag}"`
                        : searchQuery 
                          ? "No papers found matching your search"
                          : "No papers found"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPapers.map((paper) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30 dark:border-white/10"
                        >
                          {editingPaper?.id === paper.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Title
                                </label>
                                <Input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Link
                                </label>
                                <Input
                                  type="text"
                                  value={editForm.link}
                                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                                  className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Note
                                </label>
                                <Textarea
                                  value={editForm.note}
                                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                  className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Tags (comma separated)
                                </label>
                                <Input
                                  type="text"
                                  value={editForm.tags.join(", ")}
                                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(",").map(t => t.trim()) })}
                                  className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  onClick={cancelEditing}
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                                <Button
                                  onClick={updatePaper}
                                  className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    {paper.title}
                                  </h3>
                                  {paper.note && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                      {paper.note}
                                    </p>
                                  )}
                                  {paper.tags && paper.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {paper.tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => toggleStatus(paper.id, paper.status)}
                                    variant={paper.status === "read" ? "default" : "outline"}
                                    className="rounded-full"
                                  >
                                    {paper.status === "read" ? "Read" : "Unread"}
                                  </Button>
                                  {paper.link && (
                                    <Button
                                      asChild
                                      variant="outline"
                                      className="rounded-full"
                                    >
                                      <a href={paper.link} target="_blank" rel="noopener noreferrer">
                                        View
                                      </a>
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => startEditing(paper)}
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full h-8 w-8"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => deletePaper(paper.id)}
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 