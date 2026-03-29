'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, Popconfirm, Tag, Modal, Input, Form, Space, Select } from 'antd'
import { LockOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import { debounce } from 'lodash'

const ROLE_OPTIONS = [
  { value: 'User', label: 'Người dùng' },
  { value: 'admin', label: 'Quản trị' },
  { value: 'super_admin', label: 'Super admin' },
]

export default function AdminUserPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [updatingRoleId, setUpdatingRoleId] = useState(null)

  const fetchUsers = useCallback(async (q = '') => {
    try {
      setLoading(true)
      const res = await API.AdminUser.list(q ? { q } : {})
      setUsers(res.data)
    } catch (err) {
      toast.error('Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        fetchUsers(value.trim())
      }, 350),
    [fetchUsers]
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  const handleDelete = async (id) => {
    try {
      await API.AdminUser.delete(id)
      toast.success('Đã xóa người dùng')
      fetchUsers(searchQ.trim())
    } catch (err) {
      toast.error('Xóa người dùng thất bại')
    }
  }

  const toggleLock = async (id) => {
    try {
      await API.AdminUser.block(id)
      toast.success('Đã cập nhật trạng thái khóa')
      fetchUsers(searchQ.trim())
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  const handleActivate = async (id) => {
    try {
      await API.AdminUser.activate(id)
      toast.success('Đã kích hoạt tài khoản thành công')
      fetchUsers(searchQ.trim())
    } catch (err) {
      toast.error('Lỗi khi kích hoạt tài khoản')
    }
  }

  const handleEdit = (record) => {
    setEditingUser(record)
    setIsModalOpen(true)
  }

  const handleUpdate = async (values) => {
    try {
      await API.AdminUser.update(editingUser._id, {
        name: values.name,
        email: values.email,
        role: editingUser.role,
        phone: editingUser.phone,
        status: editingUser.status,
      })
      toast.success('Cập nhật thông tin thành công')
      setIsModalOpen(false)
      fetchUsers(searchQ.trim())
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message
      toast.error(msg || 'Lỗi khi cập nhật người dùng')
    }
  }

  const handleRoleChange = async (record, newRole) => {
    if (newRole === record.role) return
    try {
      setUpdatingRoleId(record._id)
      await API.AdminUser.update(record._id, {
        name: record.name,
        email: record.email,
        phone: record.phone,
        status: record.status,
        role: newRole,
      })
      toast.success('Đã cập nhật vai trò')
      fetchUsers(searchQ.trim())
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message
      toast.error(msg || 'Không thể đổi vai trò')
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 200,
      render: (role, record) => (
        <Select
          size="small"
          className="min-w-[160px]"
          value={role}
          options={ROLE_OPTIONS}
          loading={updatingRoleId === record._id}
          disabled={updatingRoleId != null}
          onChange={(v) => handleRoleChange(record, v)}
        />
      ),
    },
    {
      title: 'Xác minh',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified) =>
        isVerified ? <Tag color="green">Đã xác minh</Tag> : <Tag color="orange">Chưa xác minh</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) =>
        status === 'inactive' ? <Tag color="red">Đã khóa</Tag> : <Tag color="green">Hoạt động</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const isSuperAdminRow = record.role === 'super_admin'
        return (
          <Space wrap>
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
              Sửa
            </Button>
            {!record.isVerified && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleActivate(record._id)}
              >
                Kích hoạt
              </Button>
            )}
            <Button icon={<LockOutlined />} size="small" onClick={() => toggleLock(record._id)}>
              {record.status === 'inactive' ? 'Mở khóa' : 'Khóa'}
            </Button>
            {!isSuperAdminRow && (
              <Popconfirm
                title="Xác nhận xóa người dùng?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger icon={<DeleteOutlined />} size="small">
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Quản lý người dùng</h1>
          <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Input
              allowClear
              size="large"
              placeholder="Tìm theo tên, email hoặc số điện thoại…"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQ}
              onChange={(e) => {
                const v = e.target.value
                setSearchQ(v)
                debouncedSearch(v)
              }}
              className="max-w-md"
            />
          </div>
          <Table
            rowKey="_id"
            dataSource={users}
            columns={columns}
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
            loading={loading}
          />
        </div>

        <Modal
          title="Cập nhật thông tin người dùng"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            key={editingUser?._id || 'new'}
            layout="vertical"
            onFinish={handleUpdate}
            initialValues={editingUser || {}}
          >
            <Form.Item name="name" label="Tên người dùng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}
