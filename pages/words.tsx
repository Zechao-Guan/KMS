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
  notes: string;
};

const formSchema = z.object({
  word: z.string().min(1, "Word cannot be empty"),
  definition: z.string().optional(),
  notes: z.string().optional(),
});

// Search bar component
const SearchBar = memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="mb-6">
    <Input
      type="text"
      placeholder="Search words or definitions..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  </div>
));
SearchBar.displayName = "SearchBar";

// Status filter buttons component
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
      All
    </button>
    <button
      onClick={() => onFilterChange("unmastered")}
      className={`px-4 py-2 rounded ${
        currentFilter === "unmastered" ? "bg-yellow-400 text-white" : "bg-gray-200"
      }`}
    >
      Unmastered
    </button>
    <button
      onClick={() => onFilterChange("mastered")}
      className={`px-4 py-2 rounded ${
        currentFilter === "mastered" ? "bg-green-400 text-white" : "bg-gray-200"
      }`}
    >
      Mastered
    </button>
  </div>
));
FilterButtons.displayName = "FilterButtons";

// Word card component
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
      <div className="text-xs text-gray-400">{word.notes}</div>
      <div className="text-xs text-gray-400">{new Date(word.created_at).toLocaleString()}</div>
    </div>
    <button
      className={`mt-2 md:mt-0 px-3 py-1 rounded ${word.status === "unmastered" ? "bg-yellow-400" : "bg-green-400"} text-white`}
      onClick={() => onToggleStatus(word.id, word.status)}
    >
      {word.status === "unmastered" ? "Mark as mastered" : "Mark as unmastered"}
    </button>
  </li>
));
WordCard.displayName = "WordCard";

// Add word form component
const AddWordForm = memo(({ 
  onSubmit, 
  onCancel, 
  isAdding 
}: { 
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isAdding: boolean;
}) => {
  const [formData, setFormData] = useState<NewWord>({ word: "", definition: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
    setFormData({ word: "", definition: "", notes: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow flex flex-col gap-2">
      <input
        className="border rounded px-3 py-2"
        placeholder="Word"
        value={formData.word}
        onChange={e => setFormData(f => ({ ...f, word: e.target.value }))}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Definition"
        value={formData.definition}
        onChange={e => setFormData(f => ({ ...f, definition: e.target.value }))}
        required
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Notes"
        value={formData.notes}
        onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          disabled={isAdding}
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100 transition"
        >
          Cancel
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
            {/* Left form */}
            <div className="w-full md:w-1/3">
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 dark:border-white/10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Add New Word
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Word
                    </label>
                    <Input
                      type="text"
                      value={form.getValues("word")}
                      onChange={(e) => form.setValue("word", e.target.value)}
                      className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Enter word"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Definition
                    </label>
                    <Input
                      type="text"
                      value={form.getValues("definition")}
                      onChange={(e) => form.setValue("definition", e.target.value)}
                      className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Enter definition (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <Input
                      type="text"
                      value={form.getValues("notes")}
                      onChange={(e) => form.setValue("notes", e.target.value)}
                      className="rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                      placeholder="Add notes (optional)"
                    />
                  </div>
                  <button
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full rounded-full bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222]
                             text-black dark:text-white px-6 py-2 shadow-lg hover:scale-105 transition-transform
                             font-medium"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Word"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right list */}
            <div className="w-full md:w-2/3">
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 dark:border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300"
                    placeholder="Search words or definitions..."
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
                      onClick={() => setFilter('mastered')}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all
                        ${filter === 'mastered' 
                          ? 'bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222] text-black dark:text-white shadow-lg' 
                          : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'}`}
                    >
                      Mastered
                    </button>
                    <button
                      onClick={() => setFilter('unmastered')}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all
                        ${filter === 'unmastered' 
                          ? 'bg-gradient-to-br from-[#e0e0e0] to-[#f9f9f9] dark:from-[#444] dark:to-[#222] text-black dark:text-white shadow-lg' 
                          : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'}`}
                    >
                      Unmastered
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading...</div>
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
                            {word.status === "mastered" ? 'Mastered' : 'Unmastered'}
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