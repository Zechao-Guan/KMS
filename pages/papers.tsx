import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Check, X } from 'lucide-react'

type Paper = {
  id: number
  title: string
  link: string
  note: string
  status: 'read' | 'unread'
  created_at: string
}

export default function Papers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newPaper, setNewPaper] = useState({
    title: '',
    link: '',
    note: '',
  })
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')

  useEffect(() => {
    fetchPapers()
  }, [])

  async function fetchPapers() {
    try {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPapers(data || [])
    } catch (error) {
      console.error('Error fetching papers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addPaper(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('papers')
        .insert([{ ...newPaper, status: 'unread' }])
        .select()

      if (error) throw error
      setPapers([...(data || []), ...papers])
      setNewPaper({ title: '', link: '', note: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding paper:', error)
    }
  }

  async function toggleStatus(id: number, currentStatus: 'read' | 'unread') {
    try {
      const newStatus = currentStatus === 'read' ? 'unread' : 'read'
      const { error } = await supabase
        .from('papers')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      setPapers(papers.map(paper => 
        paper.id === id ? { ...paper, status: newStatus } : paper
      ))
    } catch (error) {
      console.error('Error updating paper status:', error)
    }
  }

  const filteredPapers = papers.filter(paper => 
    filter === 'all' ? true : paper.status === filter
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">论文管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加论文
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            未读
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已读
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addPaper} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标题
              </label>
              <input
                type="text"
                value={newPaper.title}
                onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                链接
              </label>
              <input
                type="url"
                value={newPaper.link}
                onChange={(e) => setNewPaper({ ...newPaper, link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备注
              </label>
              <textarea
                value={newPaper.note}
                onChange={(e) => setNewPaper({ ...newPaper, note: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {paper.title}
                  </h3>
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {paper.link}
                  </a>
                  {paper.note && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {paper.note}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleStatus(paper.id, paper.status)}
                  className={`p-2 rounded-full ${
                    paper.status === 'read'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {paper.status === 'read' ? (
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