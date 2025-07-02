'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Modal, Input, Form, Tag, message, Popconfirm, Space } from 'antd'
import { EditOutlined, LinkOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function AdminAdsPage() {
    const [ads, setAds] = useState([])
    const [editingAd, setEditingAd] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        fetchAds()
    }, [])

    const fetchAds = async () => {
        try {
            const res = await API.AdminAds.list()
            setAds(res.data || [])
        } catch (err) {
            toast.error('Không thể tải danh sách quảng cáo')
        }
    }

    const handleAdEdit = (record) => {
        setEditingAd(record)
        form.setFieldsValue(record)
        setIsModalOpen(true)
    }

    const handleAdDelete = async (id) => {
        try {
            await API.AdminAds.delete(id)
            toast.success('Đã xóa quảng cáo')
            fetchAds()
        } catch (err) {
            toast.error('Xóa quảng cáo thất bại')
        }
    }

    const handleAdUpdate = async (values) => {
        try {
            if (editingAd) {
                await API.AdminAds.update(editingAd._id, values)
                toast.success('Cập nhật quảng cáo thành công')
            } else {
                await API.AdminAds.create(values)
                toast.success('Thêm quảng cáo thành công')
            }
            setIsModalOpen(false)
            form.resetFields()
            setEditingAd(null)
            fetchAds()
        } catch (err) {
            toast.error('Lỗi khi gửi dữ liệu')
        }
    }

    const toggleAdStatus = async (record) => {
        try {
            await API.AdminAds.update(record._id, { active: !record.active })
            toast.success('Đã cập nhật trạng thái hiển thị')
            fetchAds()
        } catch (err) {
            toast.error('Lỗi khi cập nhật trạng thái')
        }
    }

    const adColumns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Liên kết',
            dataIndex: 'url',
            key: 'url',
            render: (text) => <a href={text} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{text}</a>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => active ? <Tag color="green">Hiển thị</Tag> : <Tag color="red">Ẩn</Tag>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleAdEdit(record)}>Sửa</Button>
                    <Popconfirm
                        title="Xác nhận xóa quảng cáo?"
                        onConfirm={() => handleAdDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button size="small" icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                    <Button
                        size="small"
                        icon={<StopOutlined />}
                        onClick={() => toggleAdStatus(record)}
                        type={record.active ? 'default' : 'primary'}
                    >
                        {record.active ? 'Tắt' : 'Bật'}
                    </Button>
                </Space>
            )
        }
    ]

    return (
        <div>
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">🔗 Quản lý quảng cáo</h2>
                        <Button icon={<LinkOutlined />} onClick={() => {
                            setEditingAd(null)
                            form.resetFields()
                            setIsModalOpen(true)
                        }}>Thêm liên kết</Button>
                    </div>

                    <Table rowKey="_id" dataSource={ads} columns={adColumns} pagination={false} bordered scroll={{ x: true }} />

                    <Modal
                        title={editingAd ? 'Cập nhật liên kết quảng cáo' : 'Thêm liên kết quảng cáo'}
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        footer={null}
                        width={500}
                    >
                        <Form layout="vertical" form={form} onFinish={handleAdUpdate}>
                            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}> 
                                <Input />
                            </Form.Item>
                            <Form.Item name="url" label="Liên kết" rules={[{ required: true, message: 'Nhập URL' }]}> 
                                <Input />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    {editingAd ? 'Cập nhật' : 'Thêm'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </div>
        </div>
    )
}
