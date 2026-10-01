import { useEffect, useState } from 'react'
import type {
  Notification,
  Page,
} from '../../types'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

interface NotificationsPageProps {
  navigate: (
    page: Page,
    params?: { complaintId?: string }
  ) => void
}

function formatDate(date?: string) {
  if (!date) {
    return ''
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getNotificationStyle(type?: string) {
  switch (type?.toUpperCase()) {
    case 'SUCCESS':
      return {
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        border: 'border-green-200',
      }

    case 'WARNING':
      return {
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        border: 'border-yellow-200',
      }

    case 'ERROR':
      return {
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        border: 'border-red-200',
      }

    default:
      return {
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        border: 'border-blue-200',
      }
  }
}

function getNotificationIcon(type?: string) {
  switch (type?.toUpperCase()) {
    case 'SUCCESS':
      return '✓'

    case 'WARNING':
      return '!'

    case 'ERROR':
      return '×'

    default:
      return 'i'
  }
}

export default function NotificationsPage({
  navigate,
}: NotificationsPageProps) {
  const { email, role } = useAuth()

  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!email) {
        setError(
          'Unable to determine the logged-in user.'
        )
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response =
          await api.get<Notification[]>(
            '/api/notifications',
            {
              params: {
                email,
              },
            }
          )

        setNotifications(response.data)
      } catch (err) {
        console.error(
          'Failed to load notifications:',
          err
        )

        setError(
          'Unable to load notifications. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [email])

  const markAsRead = async (
    notificationId: number
  ) => {
    try {
      await api.put(
        `/api/notifications/${notificationId}/read`
      )

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      )
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      )
    }
  }

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    if (
      notification.complaintId !== undefined &&
      notification.complaintId !== null
    ) {
      const complaintId = String(
        notification.complaintId
      )

      if (role === 'OFFICER') {
        sessionStorage.setItem(
          'civicconnect.officer.notificationComplaintId',
          complaintId
        )

        navigate('officer-dashboard')
        return
      }

      if (role === 'ADMIN') {
        sessionStorage.setItem(
          'civicconnect.admin.notificationComplaintId',
          complaintId
        )

        navigate('admin-complaints')
        return
      }

      navigate('citizen-detail', {
        complaintId,
      })
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-7">

        <div>
          <h1
            className="text-2xl font-bold text-navy-900"
            style={{
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Notifications
          </h1>

          <p className="text-sm text-navy-500 mt-1">
            Stay updated about your complaints and their progress.
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="flex-shrink-0 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-xs font-semibold">
            {unreadCount} unread
          </span>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">
          <div className="w-9 h-9 border-4 border-navy-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-navy-500">
            Loading notifications...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-navy-200/60 p-12 text-center">

            <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl text-brand-600">
                🔔
              </span>
            </div>

            <h2 className="text-lg font-bold text-navy-900">
              You're all caught up
            </h2>

            <p className="text-sm text-navy-500 mt-2">
              New updates about your complaints will appear here.
            </p>

          </div>
        )}

      {/* Notifications */}
      {!loading &&
        !error &&
        notifications.length > 0 && (
          <div className="space-y-3">

            {notifications.map(
              (notification) => {
                const style =
                  getNotificationStyle(
                    notification.type
                  )

                return (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`w-full text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                      notification.isRead
                        ? 'border-navy-200/60'
                        : 'border-brand-200 bg-brand-50/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">

                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.iconColor}`}
                      >
                        <span className="font-bold">
                          {getNotificationIcon(
                            notification.type
                          )}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-3">

                          <p
                            className={`text-sm leading-relaxed ${
                              notification.isRead
                                ? 'text-navy-600'
                                : 'text-navy-900 font-semibold'
                            }`}
                          >
                            {notification.message}
                          </p>

                          {!notification.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />
                          )}

                        </div>

                        <div className="flex items-center gap-3 mt-2">

                          {notification.type && (
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${style.iconBg} ${style.iconColor}`}
                            >
                              {notification.type}
                            </span>
                          )}

                          <span className="text-xs text-navy-400">
                            {formatDate(
                              notification.createdAt
                            )}
                          </span>

                        </div>

                      </div>
                    </div>
                  </button>
                )
              }
            )}

          </div>
        )}

    </div>
  )
}