'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getStoredUser } from '@/lib/auth'
import { adminAPI, subjectsAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { Plus, Edit, Trash2, BookOpen, FileText, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'subjects' | 'chapters' | 'quizzes'>('subjects')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = getStoredUser()
    if (currentUser?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUser(currentUser)
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll()
      setSubjects(response.data)
    } catch (error) {
      toast.error('Failed to load subjects')
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setFormData({})
    setShowModal(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      if (type === 'subject') {
        await adminAPI.deleteSubject(id)
      } else if (type === 'chapter') {
        await adminAPI.deleteChapter(id)
      } else if (type === 'quiz') {
        await adminAPI.deleteQuiz(id)
      }
      toast.success('Deleted successfully')
      loadSubjects()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (activeTab === 'subjects') {
        if (editingItem) {
          await adminAPI.updateSubject(editingItem._id, formData)
          toast.success('Subject updated')
        } else {
          await adminAPI.createSubject(formData)
          toast.success('Subject created')
        }
      }
      // Add similar handlers for chapters and quizzes
      setShowModal(false)
      loadSubjects()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage subjects, chapters, and quizzes
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'subjects'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'chapters'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Chapters
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'quizzes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-5 h-5 inline mr-2" />
            Quizzes
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New
            </button>
          </div>

          {/* Subjects List */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      {subject.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.chapters?.length || 0} chapters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id, 'subject')}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add placeholder for chapters and quizzes */}
          {(activeTab === 'chapters' || activeTab === 'quizzes') && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && activeTab === 'subjects' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingItem ? 'Edit' : 'Create'} Subject
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon || '📚'}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color (hex)
                  </label>
                  <input
                    type="color"
                    value={formData.color || '#6366f1'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



