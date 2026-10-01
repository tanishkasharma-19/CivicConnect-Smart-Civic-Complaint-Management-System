import { useEffect, useState } from 'react'
import type { Page } from '../../types'
import api from '../../api/axios'
import {
  BuildingOfficeIcon,
} from '../../components/Icons'

interface AdminDepartmentsProps {
  navigate: (page: Page) => void
}

interface Department {
  id: number
  name: string
  description?: string
  email?: string
  phone?: string
  categoryType: string
  createdAt?: string
}

const CATEGORY_OPTIONS = [
  'ROAD',
  'GARBAGE',
  'WATER',
  'ELECTRICITY',
  'DRAINAGE',
  'OTHER',
]

function formatCategory(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}

export default function AdminDepartments({
  navigate,
}: AdminDepartmentsProps) {
  const [departments, setDepartments] =
    useState<Department[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [editing, setEditing] =
    useState<Department | null>(null)

  const [form, setForm] =
    useState({
      name: '',
      description: '',
      email: '',
      phone: '',
      categoryType: '',
    })

  const [saving, setSaving] =
    useState(false)

  const loadDepartments = async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await api.get<Department[]>(
          '/api/departments'
        )

      setDepartments(
        response.data
      )
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load departments.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const openCreate = () => {
    setEditing(null)

    setForm({
      name: '',
      description: '',
      email: '',
      phone: '',
      categoryType: '',
    })

    setShowModal(true)
  }

  const openEdit = (
    department: Department
  ) => {
    setEditing(department)

    setForm({
      name: department.name,
      description:
        department.description || '',
      email: department.email || '',
      phone: department.phone || '',
      categoryType:
        department.categoryType,
    })

    setShowModal(true)
  }

  const saveDepartment = async () => {
    if (
      !form.name.trim() ||
      !form.categoryType
    ) {
      setError(
        'Department name and category are required.'
      )
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editing) {
        await api.put(
          `/api/departments/${editing.id}`,
          {
            name: form.name,
            description:
              form.description,
            email: form.email,
            phone: form.phone,
            categoryType:
              form.categoryType,
          }
        )
      } else {
        await api.post(
          '/api/departments',
          {
            name: form.name,
            description:
              form.description,
            email: form.email,
            phone: form.phone,
            categoryType:
              form.categoryType,
          }
        )
      }

      setShowModal(false)
      await loadDepartments()
    } catch (err) {
      console.error(err)

      const backendMessage = (
        err as {
          response?: {
            data?: { message?: string }
          }
        }
      ).response?.data?.message

      setError(
        backendMessage ||
          'Unable to save department.'
      )
    } finally {
      setSaving(false)
    }
  }

  const deleteDepartment = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this department?'
      )

    if (!confirmed) {
      return
    }

    try {
      setSaving(true)
      setError('')

      await api.delete(
        `/api/departments/${id}`
      )

      await loadDepartments()
    } catch (err) {
      console.error(err)

      const backendMessage = (
        err as {
          response?: {
            data?: { message?: string }
          }
        }
      ).response?.data?.message

      setError(
        backendMessage ||
          'Unable to delete department. It may still be in use.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto">

            <div className="p-4 sm:p-5 border-b border-navy-100 flex items-center justify-between gap-3">

              <div>
                <h2 className="text-lg font-bold text-navy-900">
                  {editing
                    ? 'Edit Department'
                    : 'Add Department'}
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowModal(
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
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Department name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm"
              />

              <select
                value={
                  form.categoryType
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoryType:
                      e.target.value,
                  })
                }
                disabled={!!editing}
                className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 bg-white text-sm disabled:bg-navy-50 disabled:text-navy-500"
              >
                <option value="">
                  Select category
                </option>

                {CATEGORY_OPTIONS.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {formatCategory(
                        category
                      )}
                    </option>
                  )
                )}
              </select>

              {(
                <>
                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
                          e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Description"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm resize-none"
                  />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="Department email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm"
                  />

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Department phone"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm"
                  />
                </>
              )}

              {editing && (
                <p className="text-xs text-navy-400">
                  The category cannot be changed, because complaints are
                  matched to departments by category.
                </p>
              )}

              <button
                onClick={
                  saveDepartment
                }
                disabled={saving}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl text-sm font-semibold"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Department'}
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
            Department Management
          </h1>

          <p className="text-sm text-navy-500 mt-0.5">
            Manage municipal departments.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm"
        >
          + Add Department
        </button>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-sm text-navy-500">
          Loading departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <p className="text-sm text-navy-400">
            No departments found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

          {departments.map(
            (department) => (
              <div
                key={department.id}
                className="bg-white rounded-2xl border border-navy-200/60 p-5 shadow-sm hover:shadow-md transition-all"
              >

                <div className="flex items-start justify-between gap-3 mb-4">

                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-brand-600" />
                  </div>

                  <span className="text-xs font-medium bg-navy-100 text-navy-600 px-2.5 py-1 rounded-full">
                    {formatCategory(
                      department.categoryType
                    )}
                  </span>

                </div>

                <h3 className="text-base font-bold text-navy-900">
                  {department.name}
                </h3>

                {department.description && (
                  <p className="text-xs text-navy-500 mt-2 line-clamp-3">
                    {department.description}
                  </p>
                )}

                {department.email && (
                  <p className="text-xs text-navy-500 mt-3">
                    {department.email}
                  </p>
                )}

                {department.phone && (
                  <p className="text-xs text-navy-500 mt-1">
                    {department.phone}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 mt-5 pt-4 border-t border-navy-100">

                  <button
                    onClick={() =>
                      openEdit(
                        department
                      )
                    }
                    className="flex-1 py-2 border border-navy-200 text-navy-700 rounded-xl text-xs font-semibold hover:bg-navy-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteDepartment(
                        department.id
                      )
                    }
                    disabled={saving}
                    className="flex-1 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  )
}