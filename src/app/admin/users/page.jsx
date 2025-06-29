'use client'

import { useEffect, useState } from 'react'
import { Table, Button, message, Popconfirm, Tag, Modal, Input, Form, Space } from 'antd'
import { LockOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'

const FAKE_USERS = [
    { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin', locked: false },
    { id: 2, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', locked: false },
    { id: 3, name: 'Trần Thị B', email: 'b@example.com', role: 'user', locked: false },
    { id: 4, name: 'Lê Cường', email: 'c@example.com', role: 'user', locked: true },
    { id: 5, name: 'Phạm Dũng', email: 'd@example.com', role: 'user', locked: false },
]

export default function AdminUserPage() {
    const [users, setUsers] = useState([])
    const [editingUser, setEditingUser] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        setUsers(FAKE_USERS)
    }, [])

    const handleDelete = (id) => {
        const updated = users.filter((u) => u.id !== id)
        setUsers(updated)
        message.success('Đã xóa người dùng')
    }

    const toggleLock = (id) => {
        const updated = users.map((u) =>
            u.id === id ? { ...u, locked: !u.locked } : u
        )
        setUsers(updated)
        message.success('Đã cập nhật trạng thái khóa')
    }

    const handleEdit = (record) => {
        setEditingUser(record)
        setIsModalOpen(true)
    }

    const handleUpdate = (values) => {
        const updated = users.map((u) =>
            u.id === editingUser.id ? { ...u, ...values } : u
        )
        setUsers(updated)
        setIsModalOpen(false)
        message.success('Cập nhật thông tin thành công')
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
            render: (role) => role === 'admin' ? <Tag color="volcano">Quản trị</Tag> : <Tag color="blue">Người dùng</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'locked',
            key: 'locked',
            render: (locked) => locked ? <Tag color="red">Đã khóa</Tag> : <Tag color="green">Hoạt động</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                record.role === 'admin' ? null : (
                    <Space>
                        <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                        <Button icon={<LockOutlined />} size="small" onClick={() => toggleLock(record.id)}>
                            {record.locked ? 'Mở khóa' : 'Khóa'}
                        </Button>
                        <Popconfirm title="Xác nhận xóa người dùng?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                            <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                        </Popconfirm>
                    </Space>
                )
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Quản lý người dùng</h1>
                    <div className="mt-10 transition-transform duration-200">
                        <Table rowKey="id" dataSource={users} columns={columns} bordered pagination={{ pageSize: 5 }}
                            scroll={{ x: true }} />
                    </div>
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
                            <Button type="primary" htmlType="submit" block>Cập nhật</Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    )
}
