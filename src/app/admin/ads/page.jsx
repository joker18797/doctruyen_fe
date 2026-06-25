'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Modal, Input, Form, Tag, message, Popconfirm, Space, Table as AntTable, Spin, Upload, Select } from 'antd'
import { EditOutlined, LinkOutlined, DeleteOutlined, StopOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'
import Image from 'next/image'

export default function AdminAdsPage() {
    const [ads, setAds] = useState([])
    const [editingAd, setEditingAd] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [clickHistoryModal, setClickHistoryModal] = useState(false)
    const [clickHistory, setClickHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [selectedAd, setSelectedAd] = useState(null)
    const [form] = Form.useForm()
    const [imageFile, setImageFile] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)

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
        setPreviewImage(record.image || null)
        setImageFile(null)
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
            const formData = new FormData()
            formData.append('title', values.title)
            formData.append('url', values.url)
            formData.append('type', values.type || 'default')

            // Nếu có file ảnh mới, thêm vào FormData
            if (imageFile) {
                formData.append('image', imageFile)
            }
            
            if (editingAd) {
                await API.AdminAds.update(editingAd._id, formData)
                toast.success('Cập nhật quảng cáo thành công')
            } else {
                await API.AdminAds.create(formData)
                toast.success('Thêm quảng cáo thành công')
            }
            setIsModalOpen(false)
            form.resetFields()
            setEditingAd(null)
            setImageFile(null)
            setPreviewImage(null)
            fetchAds()
        } catch (err) {
            toast.error('Lỗi khi gửi dữ liệu')
        }
    }
    
    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result)
            }
            reader.readAsDataURL(file)
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

    const handleViewClickHistory = async (record) => {
        try {
            setSelectedAd(record)
            setLoadingHistory(true)
            setClickHistoryModal(true)
            const res = await API.AdminAds.getClickHistory(record._id, 30)
            if (res?.status === 200) {
                setClickHistory(res.data.data || [])
            } else {
                toast.error('Không thể tải lịch sử click')
            }
        } catch (err) {
            toast.error('Lỗi khi tải lịch sử click')
        } finally {
            setLoadingHistory(false)
        }
    }

    const adColumns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image) => image ? (
                <Image src={image} alt="Ad" width={80} height={60} className="object-cover rounded" />
            ) : (
                <span className="text-gray-400">Chưa có ảnh</span>
            ),
        },
        {
            title: 'Liên kết',
            dataIndex: 'url',
            key: 'url',
            render: (text) => <a href={text} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{text}</a>,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => type === 'shopee_food'
                ? <Tag color="orange">Shopee Food (giữa truyện)</Tag>
                : <Tag color="blue">Mặc định</Tag>
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
                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewClickHistory(record)}>
                        Xem click
                    </Button>
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
                            setImageFile(null)
                            setPreviewImage(null)
                            setIsModalOpen(true)
                        }}>Thêm liên kết</Button>
                    </div>

                    <Table rowKey="_id" dataSource={ads} columns={adColumns} pagination={false} bordered scroll={{ x: true }} />

                    <Modal
                        title={editingAd ? 'Cập nhật liên kết quảng cáo' : 'Thêm liên kết quảng cáo'}
                        open={isModalOpen}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setImageFile(null)
                            setPreviewImage(null)
                        }}
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
                            <Form.Item name="type" label="Loại quảng cáo" initialValue="default">
                                <Select
                                    options={[
                                        { value: 'default', label: 'Mặc định (mở khóa / cuối chương)' },
                                        { value: 'shopee_food', label: 'Shopee Food (hiển thị ở giữa truyện)' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item label="Ảnh quảng cáo">
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {previewImage && (
                                        <div className="mt-2">
                                            <Image 
                                                src={previewImage} 
                                                alt="Preview" 
                                                width={200} 
                                                height={150} 
                                                className="object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                    {!previewImage && editingAd?.image && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-1">Ảnh hiện tại:</p>
                                            <Image 
                                                src={editingAd.image} 
                                                alt="Current" 
                                                width={200} 
                                                height={150} 
                                                className="object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    {editingAd ? 'Cập nhật' : 'Thêm'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        title={
                            <div className="flex items-center gap-2">
                                <EyeOutlined />
                                <span>Lịch sử click - {selectedAd?.title}</span>
                            </div>
                        }
                        open={clickHistoryModal}
                        onCancel={() => {
                            setClickHistoryModal(false)
                            setSelectedAd(null)
                            setClickHistory([])
                        }}
                        footer={null}
                        width={700}
                    >
                        {loadingHistory ? (
                            <div className="flex justify-center items-center py-10">
                                <Spin />
                            </div>
                        ) : clickHistory.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                Chưa có dữ liệu click
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Tổng click:</span>{' '}
                                        {clickHistory.reduce((sum, item) => sum + item.clickCount, 0).toLocaleString()}
                                    </p>
                                </div>
                                <AntTable
                                    dataSource={clickHistory}
                                    rowKey="date"
                                    pagination={{ pageSize: 10 }}
                                    columns={[
                                        {
                                            title: 'Ngày',
                                            dataIndex: 'date',
                                            key: 'date',
                                            render: (date) => {
                                                const d = new Date(date + 'T00:00:00')
                                                return d.toLocaleDateString('vi-VN', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                            },
                                            sorter: (a, b) => a.date.localeCompare(b.date),
                                            defaultSortOrder: 'descend'
                                        },
                                        {
                                            title: 'Số lượt click',
                                            dataIndex: 'clickCount',
                                            key: 'clickCount',
                                            render: (count) => (
                                                <span className="font-semibold text-blue-600">
                                                    {count.toLocaleString()}
                                                </span>
                                            ),
                                            sorter: (a, b) => a.clickCount - b.clickCount,
                                        }
                                    ]}
                                />
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    )
}
