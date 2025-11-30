'use client'

import { useEffect, useState } from 'react'
import { Table, Button, message, Popconfirm, Tag, Modal, Input, Form, Space } from 'antd'
import { LockOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function AdminUserPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await API.AdminUser.list() 
      setUsers(res.data)
    } catch (err) {
      toast.error('Lỗi khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.AdminUser.delete(id)
      toast.success('Đã xóa người dùng')
      fetchUsers()
    } catch (err) {
      toast.error('Xóa người dùng thất bại')
    }
  }

  const toggleLock = async (id) => {
    try {
      await API.AdminUser.block(id)
      toast.success('Đã cập nhật trạng thái khóa')
      fetchUsers()
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  const handleActivate = async (id) => {
    try {
      await API.AdminUser.activate(id)
      toast.success('Đã kích hoạt tài khoản thành công')
      fetchUsers()
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
      await API.AdminUser.update(editingUser._id, values)
      toast.success('Cập nhật thông tin thành công')
      setIsModalOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error('Lỗi khi cập nhật người dùng')
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
      render: (role) =>
        role === 'admin' ? <Tag color="volcano">Quản trị</Tag> : <Tag color="blue">Người dùng</Tag>,
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
      render: (_, record) =>
        record.role === 'admin' ? null : (
          <Space>
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
          </Space>
        ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Quản lý người dùng</h1>
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
        >
          <Form layout="vertical" onFinish={handleUpdate} initialValues={editingUser}>
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
