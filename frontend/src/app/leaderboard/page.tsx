'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { leaderboardAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { Trophy, Medal, Award, Crown } from 'lucide-react'

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [type, setType] = useState('points')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadLeaderboard()
  }, [type])

  const loadLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get(type)
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <Award className="w-6 h-6 text-gray-400" />
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-primary-600" />
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how you rank among other students
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setType('points')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              type === 'points'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By Points
          </button>
          <button
            onClick={() => setType('streak')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              type === 'streak'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By Streak
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {type === 'points' ? 'Points' : 'Streak'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Badges
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      entry.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank)}
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                          {entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        entry.isCurrentUser
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {entry.name}
                        {entry.isCurrentUser && ' (You)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {type === 'points' ? entry.points : `${entry.streak} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {entry.badges && entry.badges.length > 0 ? (
                          entry.badges.map((badge: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs"
                            >
                              {badge}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No leaderboard data available.</p>
          </div>
        )}
      </div>
    </div>
  )
}



