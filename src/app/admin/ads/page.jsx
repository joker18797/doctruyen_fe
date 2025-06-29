// pages/admin/ads.js
'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Modal, Input, Form, Tag, message, Popconfirm, Space, Switch } from 'antd'
import { EditOutlined, LinkOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'

const FAKE_ADS = [
    { id: 1, title: 'Shopee Sale', url: 'https://shopee.vn', active: true },
    { id: 2, title: 'Lazada Khuyến mãi', url: 'https://lazada.vn', active: true },
    { id: 3, title: 'Tiki Freeship', url: 'https://tiki.vn', active: false },
]

export default function AdminAdsPage() {
    const [ads, setAds] = useState([])
    const [editingAd, setEditingAd] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        setAds(FAKE_ADS)
    }, [])

    const handleAdEdit = (record) => {
        setEditingAd(record)
        setIsModalOpen(true)
    }

    const handleAdDelete = (id) => {
        setAds(ads.filter((a) => a.id !== id))
        message.success('Đã xóa quảng cáo')
    }

    const handleAdUpdate = (values) => {
        if (editingAd) {
            setAds(ads.map((a) => a.id === editingAd.id ? { ...a, ...values } : a))
        } else {
            setAds([...ads, { ...values, id: Date.now(), active: true }])
        }
        setIsModalOpen(false)
        message.success('Cập nhật liên kết quảng cáo thành công')
    }

    const toggleAdStatus = (id) => {
        setAds(ads.map((a) => a.id === id ? { ...a, active: !a.active } : a))
        message.success('Đã cập nhật trạng thái hiển thị')
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
                        onConfirm={() => handleAdDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button size="small" icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                    <Button
                        size="small"
                        icon={<StopOutlined />}
                        onClick={() => toggleAdStatus(record.id)}
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
                        <Button icon={<LinkOutlined />} onClick={() => { setEditingAd(null); setIsModalOpen(true) }}>Thêm liên kết</Button>
                    </div>

                    <div className="overflow-x-auto">
                        <Table rowKey="id" dataSource={ads} columns={adColumns} pagination={false} bordered scroll={{ x: true }} />
                    </div>

                    <Modal
                        title={editingAd ? 'Cập nhật liên kết quảng cáo' : 'Thêm liên kết quảng cáo'}
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        footer={null}
                    >
                        <Form layout="vertical" onFinish={handleAdUpdate} initialValues={editingAd || {}}>
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