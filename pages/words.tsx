import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Check, X } from 'lucide-react'

type Word = {
  id: number
  word: string
  definition: string
  example: string
  status: 'mastered' | 'unmastered'
  created_at: string
}

export default function Words() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newWord, setNewWord] = useState({
    word: '',
    definition: '',
    example: '',
  })
  const [filter, setFilter] = useState<'all' | 'mastered' | 'unmastered'>('all')

  useEffect(() => {
    fetchWords()
  }, [])

  async function fetchWords() {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWords(data || [])
    } catch (error) {
      console.error('Error fetching words:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addWord(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('words')
        .insert([{ ...newWord, status: 'unmastered' }])
        .select()

      if (error) throw error
      setWords([...(data || []), ...words])
      setNewWord({ word: '', definition: '', example: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding word:', error)
    }
  }

  async function toggleStatus(id: number, currentStatus: 'mastered' | 'unmastered') {
    try {
      const newStatus = currentStatus === 'mastered' ? 'unmastered' : 'mastered'
      const { error } = await supabase
        .from('words')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      setWords(words.map(word => 
        word.id === id ? { ...word, status: newStatus } : word
      ))
    } catch (error) {
      console.error('Error updating word status:', error)
    }
  }

  const filteredWords = words.filter(word => 
    filter === 'all' ? true : word.status === filter
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">单词管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加单词
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unmastered')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unmastered'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            未掌握
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'mastered'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已掌握
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addWord} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                单词
              </label>
              <input
                type="text"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                释义
              </label>
              <input
                type="text"
                value={newWord.definition}
                onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                例句
              </label>
              <textarea
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                添加
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="grid gap-6">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {word.word}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {word.definition}
                  </p>
                  {word.example && (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      {word.example}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleStatus(word.id, word.status)}
                  className={`p-2 rounded-full ${
                    word.status === 'mastered'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {word.status === 'mastered' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 