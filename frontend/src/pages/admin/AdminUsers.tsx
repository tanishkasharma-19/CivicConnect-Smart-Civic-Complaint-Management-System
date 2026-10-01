import { useEffect, useMemo, useState } from 'react'
import type { Page } from '../../types'
import api from '../../api/axios'
import {
  MagnifyingGlassIcon,
  TrashIcon,
} from '../../components/Icons'

interface AdminUsersProps {
  navigate: (page: Page) => void
}

interface BackendUser {
  id: number
  name: string
  email: string
  role: string
  designation?: string
  ward?: string
  department?: {
    id?: number
    name?: string
  } | null
  isActive?: boolean
  createdAt?: string
}

interface Department {
  id: number
  name: string
  categoryType: string
}

export default function AdminUsers({
  navigate,
}: AdminUsersProps) {
  const [users, setUsers] =
    useState<BackendUser[]>([])

  const [departments, setDepartments] =
    useState<Department[]>([])

  const [activeTab, setActiveTab] =
    useState<
      'CITIZEN' | 'OFFICER' | 'ADMIN'
    >('CITIZEN')

  const [search, setSearch] =
    useState('')

  const [showCreateOfficer, setShowCreateOfficer] =
    useState(false)

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      password: '',
      departmentId: '',
    })

  const [loading, setLoading] =
    useState(true)

  const [actionLoading, setActionLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        usersResponse,
        departmentsResponse,
      ] = await Promise.all([
        api.get<BackendUser[]>(
          '/api/users'
        ),
        api.get<Department[]>(
          '/api/departments'
        ),
      ])

      setUsers(
        usersResponse.data
      )

      setDepartments(
        departmentsResponse.data
      )
    } catch (err) {
      console.error(err)
      setError(
        'Unable to load users.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const counts = useMemo(
    () => ({
      CITIZEN: users.filter(
        (u) =>
          u.role === 'CITIZEN'
      ).length,

      OFFICER: users.filter(
        (u) =>
          u.role === 'OFFICER'
      ).length,

      ADMIN: users.filter(
        (u) =>
          u.role === 'ADMIN'
      ).length,
    }),
    [users]
  )

  const filteredUsers =
    users.filter(
      (user) =>
        user.role === activeTab &&
        (search === '' ||
          user.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          user.email
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ))
    )

  const createOfficer = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.departmentId
    ) {
      setError(
        'Please fill all officer fields.'
      )
      return
    }

    try {
      setActionLoading(true)
      setError('')

      await api.post(
        '/api/users/officer',
        {
          name: form.name,
          email: form.email,
          password: form.password,
          departmentId:
            Number(
              form.departmentId
            ),
        }
      )

      setForm({
        name: '',
        email: '',
        password: '',
        departmentId: '',
      })

      setShowCreateOfficer(false)

      await loadData()
    } catch (err) {
      console.error(err)
      setError(
        'Unable to create officer.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const deactivateUser = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to deactivate this user?'
      )

    if (!confirmed) {
      return
    }

    try {
      setActionLoading(true)
      setError('')

      await api.put(
        `/api/users/${id}/deactivate`
      )

      await loadData()
    } catch (err) {
      console.error(err)
      setError(
        'Unable to deactivate user.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {showCreateOfficer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto">

            <div className="p-4 sm:p-5 border-b border-navy-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-navy-900">
                  Create Officer
                </h2>

                <p className="text-xs text-navy-500 mt-1">
                  Create a new officer account.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateOfficer(
                    false
                  )
                }
                className="text-lg text-navy-500"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">

              <input
                type="text"
                placeholder="Officer name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm"
              />

              <input
                type="email"
                placeholder="Officer email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm"
              />

              <input
                type="password"
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
                      e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm"
              />

              <select
                value={
                  form.departmentId
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    departmentId:
                      e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm bg-white"
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >
                      {department.name}
                    </option>
                  )
                )}
              </select>

              <button
                onClick={
                  createOfficer
                }
                disabled={
                  actionLoading
                }
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl text-sm font-semibold"
              >
                {actionLoading
                  ? 'Creating...'
                  : 'Create Officer'}
              </button>

            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-4">

        <div>
          <h1
            className="text-xl font-bold text-navy-900"
            style={{
              fontFamily:
                "'Outfit', sans-serif",
            }}
          >
            User Management
          </h1>

          <p className="text-sm text-navy-500 mt-0.5">
            Manage platform users.
          </p>
        </div>

        <button
          onClick={() =>
            setShowCreateOfficer(
              true
            )
          }
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm"
        >
          + Add Officer
        </button>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

        {(
          [
            ['CITIZEN', 'Citizens'],
            ['OFFICER', 'Officers'],
            ['ADMIN', 'Admins'],
          ] as const
        ).map(
          ([role, label]) => (
            <button
              key={role}
              onClick={() =>
                setActiveTab(role)
              }
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                activeTab === role
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-navy-200 bg-white'
              }`}
            >
              <div className="text-2xl font-bold text-navy-900">
                {counts[role]}
              </div>

              <div className="text-xs font-semibold text-navy-500 mt-1">
                {label}
              </div>
            </button>
          )
        )}

      </div>

      <div className="bg-white rounded-2xl border border-navy-200/60 shadow-sm overflow-hidden">

        <div className="p-4 border-b border-navy-100">
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-navy-200 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">

          {loading ? (
            <div className="p-12 text-center text-sm text-navy-500">
              Loading users...
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-sm">

              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Department
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-navy-50">

                {filteredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-navy-50/50"
                    >

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-navy-900">
                              {user.name}
                            </p>

                            <p className="text-xs text-navy-400">
                              {user.email}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-navy-100 text-navy-600">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-navy-500">
                        {user.department?.name ||
                          '—'}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isActive === false
                              ? 'bg-red-50 text-red-700'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {user.isActive === false
                            ? 'Inactive'
                            : 'Active'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {user.isActive !==
                          false && (
                          <button
                            onClick={() =>
                              deactivateUser(
                                user.id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                            title="Deactivate"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          )}

        </div>

      </div>
    </div>
  )
}