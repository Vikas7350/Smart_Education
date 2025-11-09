'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/app/providers'
import { getStoredUser, clearStoredAuth } from '@/lib/auth'
import { Moon, Sun, Search, User, LogOut, BookOpen, Trophy, BarChart3, Menu, X, Settings, ChevronDown } from 'lucide-react'
import VoiceSearch from './VoiceSearch'

export default function Navbar() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const handleLogout = () => {
    clearStoredAuth()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Synapse Academy
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects, chapters, topics..."
                className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute right-2">
                <VoiceSearch onTranscript={(text) => setSearchQuery(text)} />
              </div>
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Leaderboard
            </Link>
            <Link
              href="/progress"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Progress
            </Link>
            <Link
              href="/daily-challenge"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Daily Challenge
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user?.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-20 border border-gray-200 dark:border-gray-700">
                    <Link
                      href="/subscription"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </form>
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/progress"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Progress
            </Link>
            <Link
              href="/subscription"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Manage Subscription
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

