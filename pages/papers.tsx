import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, X, Check, BookOpen, Bookmark, Tag, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

type Paper = {
  id: string;
  title: string;
  link?: string;
  note?: string;
  status: "read" | "unread";
  tags?: string[];
  created_at: string;
  updated_at: string;
};

type NewPaper = {
  title: string;
  link?: string;
  note?: string;
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
    const total = papers.length;
    const read = papers.filter(p => p.status === "read").length;
    const unread = papers.filter(p => p.status === "unread").length;
    const readPercentage = total > 0 ? Math.round((read / total) * 100) : 0;
    const unreadPercentage = total > 0 ? Math.round((unread / total) * 100) : 0;
    const uniqueTags = new Set(papers.flatMap(p => p.tags || []));

    return {
      total,
      read,
      unread,
      readPercentage,
      unreadPercentage,
      uniqueTagsCount: uniqueTags.size
    };
  }, [papers]);

  // 标签分布数据
  const tagDistribution = useMemo(() => {
    const tagCount: { [key: string]: number } = {};
    papers.forEach(paper => {
      paper.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount).map(([name, count]) => ({ name, count }));
  }, [papers]);

  // 阅读时间线数据
  const readingTimeline = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const timelineData = last30Days.map(date => {
      const papersOnDay = papers.filter(paper => {
        const paperDate = paper.status === 'read' ? paper.updated_at : paper.created_at;
        return paperDate && format(parseISO(paperDate), 'yyyy-MM-dd') === date;
      });

      return {
        date,
        count: papersOnDay.length
      };
    });

    return timelineData;
  }, [papers]);

  // 最近活动
  const recentActivity = useMemo(() => {
    return papers
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
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
    if (!newPaper.title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("papers")
        .insert([
          {
            title: newPaper.title.trim(),
            link: newPaper.link ? newPaper.link.trim() : null,
            note: newPaper.note ? newPaper.note.trim() : null,
            status: "unread",
            tags: newPaper.tags.length > 0 ? newPaper.tags : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPapers([...papers, data]);
      setNewPaper({ title: "", link: "", note: "", tags: [] });
    } catch (error) {
      console.error("Error adding paper:", error);
      setError("Failed to add paper");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: "unread" | "read") => {
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
      link: paper.link || "",
      note: paper.note || "",
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

  const deletePaper = async (id: string) => {
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
          className="max-w-7xl mx-auto space-y-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Papers
          </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Track and manage your research papers with ease
            </p>
          </div>

          {/* 总览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#333] dark:to-[#111] border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white/50 dark:bg-white/10">
                      <BookOpen className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.total}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Papers
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#333] dark:to-[#111] border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.read}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Read ({stats.readPercentage}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#333] dark:to-[#111] border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Bookmark className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.unread}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Unread ({stats.unreadPercentage}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#333] dark:to-[#111] border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.uniqueTagsCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Unique Tags
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 标签分布图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Tag Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tagDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="name" 
                        className="text-sm text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        className="text-sm text-gray-600 dark:text-gray-400"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 阅读时间线 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Reading Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readingTimeline}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="date" 
                        className="text-sm text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        className="text-sm text-gray-600 dark:text-gray-400"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 最近活动 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((paper) => (
                    <motion.div
                      key={paper.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {paper.title}
                          </h3>
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
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(parseISO(paper.updated_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 标签分类筛选 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Filter by Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {allTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-[#444] dark:to-[#222] text-black dark:text-white px-4 py-1 text-sm shadow hover:scale-105 transition-transform ${selectedTag === tag ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-105' : ''}`}
                        variant="ghost"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">No tags available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 原有的论文列表和添加表单 */}
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