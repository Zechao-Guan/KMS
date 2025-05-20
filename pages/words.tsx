import { useEffect, useState, useCallback, memo } from "react";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type Word = {
  id: number;
  word: string;
  definition: string;
  notes: string;
  status: "mastered" | "unmastered";
  created_at: string;
};

type NewWord = {
  word: string;
  definition: string;
  example: string;
};

const formSchema = z.object({
  word: z.string().min(1, "单词不能为空"),
  definition: z.string().optional(),
  notes: z.string().optional(),
});

// 搜索框组件
const SearchBar = memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="mb-6">
    <Input
      type="text"
      placeholder="搜索单词或释义..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  </div>
));
SearchBar.displayName = "SearchBar";

// 状态筛选按钮组件
const FilterButtons = memo(({ 
  currentFilter, 
  onFilterChange 
}: { 
  currentFilter: "all" | "mastered" | "unmastered";
  onFilterChange: (filter: "all" | "mastered" | "unmastered") => void;
}) => (
  <div className="flex gap-2 mb-6">
    <button
      onClick={() => onFilterChange("all")}
      className={`px-4 py-2 rounded ${
        currentFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
      }`}
    >
      全部
    </button>
    <button
      onClick={() => onFilterChange("unmastered")}
      className={`px-4 py-2 rounded ${
        currentFilter === "unmastered" ? "bg-yellow-400 text-white" : "bg-gray-200"
      }`}
    >
      未掌握
    </button>
    <button
      onClick={() => onFilterChange("mastered")}
      className={`px-4 py-2 rounded ${
        currentFilter === "mastered" ? "bg-green-400 text-white" : "bg-gray-200"
      }`}
    >
      已掌握
    </button>
  </div>
));
FilterButtons.displayName = "FilterButtons";

// 单词卡片组件
const WordCard = memo(({ 
  word, 
  onToggleStatus 
}: { 
  word: Word;
  onToggleStatus: (id: number, status: "mastered" | "unmastered") => void;
}) => (
  <li className="bg-gray-100 p-4 rounded flex flex-col md:flex-row md:items-center justify-between">
    <div>
      <div className="font-semibold text-lg">{word.word}</div>
      <div className="text-sm text-gray-600">{word.definition}</div>
      <div className="text-xs text-gray-400">{word.example}</div>
      <div className="text-xs text-gray-400">{new Date(word.created_at).toLocaleString()}</div>
    </div>
    <button
      className={`mt-2 md:mt-0 px-3 py-1 rounded ${word.status === "unmastered" ? "bg-yellow-400" : "bg-green-400"} text-white`}
      onClick={() => onToggleStatus(word.id, word.status)}
    >
      {word.status === "unmastered" ? "标为掌握" : "标为未掌握"}
    </button>
  </li>
));
WordCard.displayName = "WordCard";

// 添加单词表单组件
const AddWordForm = memo(({ 
  onSubmit, 
  onCancel, 
  isAdding 
}: { 
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isAdding: boolean;
}) => {
  const [formData, setFormData] = useState<NewWord>({ word: "", definition: "", example: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
    setFormData({ word: "", definition: "", example: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow flex flex-col gap-2">
      <input
        className="border rounded px-3 py-2"
        placeholder="单词"
        value={formData.word}
        onChange={e => setFormData(f => ({ ...f, word: e.target.value }))}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="释义"
        value={formData.definition}
        onChange={e => setFormData(f => ({ ...f, definition: e.target.value }))}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="例句"
        value={formData.example}
        onChange={e => setFormData(f => ({ ...f, example: e.target.value }))}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          disabled={isAdding}
        >
          {isAdding ? "添加中..." : "添加"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100 transition"
        >
          取消
        </button>
      </div>
    </form>
  );
});
AddWordForm.displayName = "AddWordForm";

export default function Words() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "mastered" | "unmastered">("all");
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
      definition: "",
      notes: "",
    },
  });

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setWords(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("words").insert([
      { ...values, status: "unmastered" },
    ]);
    if (error) setError(error.message);
    form.reset();
    await fetchWords();
  };

  const toggleStatus = useCallback(async (id: number, currentStatus: "mastered" | "unmastered") => {
    setLoading(true);
    setError(null);
    const newStatus = currentStatus === "mastered" ? "unmastered" : "mastered";
    const { error } = await supabase
      .from("words")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) setError(error.message);
    await fetchWords();
  }, [fetchWords]);

  const filteredWords = words.filter(word => {
    if (filter !== "all" && word.status !== filter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        word.word.toLowerCase().includes(query) ||
        word.definition.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Words
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Track and manage your vocabulary with ease.
          </p>

          <div className="flex flex-col md:flex-row gap-8">
            {/* 左侧表单 */}
            <div className="w-full md:w-1/3">
              <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                    添加单词
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="word"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">单词</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20"
                                placeholder="输入单词"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="definition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">释义</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20"
                                placeholder="输入释义（可选）"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">备注</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20"
                                placeholder="添加备注（可选）"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222]
                                 text-black dark:text-white hover:scale-105 transition-transform"
                        disabled={loading}
                      >
                        {loading ? "添加中..." : "添加"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* 右侧列表 */}
            <div className="w-full md:w-2/3">
              <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-64 bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20"
                      placeholder="搜索单词或释义..."
                    />
                    <div className="flex gap-2">
                      <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                        className="rounded-full"
                      >
                        全部
                      </Button>
                      <Button
                        variant={filter === "mastered" ? "default" : "outline"}
                        onClick={() => setFilter("mastered")}
                        className="rounded-full"
                      >
                        已掌握
                      </Button>
                      <Button
                        variant={filter === "unmastered" ? "default" : "outline"}
                        onClick={() => setFilter("unmastered")}
                        className="rounded-full"
                      >
                        未掌握
                      </Button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-300">加载中...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWords.map((word) => (
                        <div
                          key={word.id}
                          className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30 dark:border-white/10
                                   hover:scale-[1.02] transition-transform cursor-pointer"
                          onClick={() => toggleStatus(word.id, word.status)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                {word.word}
                              </h3>
                              {word.definition && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {word.definition}
                                </p>
                              )}
                              {word.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {word.notes}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium
                                ${word.status === "mastered"
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                }`}
                            >
                              {word.status === "mastered" ? '已掌握' : '未掌握'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 