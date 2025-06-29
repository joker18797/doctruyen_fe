// pages/admin/banners.js
'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Modal, Input, Form, Upload, message, Popconfirm, Image, Space } from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader';

const FAKE_BANNERS = [
  { id: 1, image: '/banner1.jpg', url: 'https://shopee.vn' },
  { id: 2, image: '/banner2.jpg', url: 'https://lazada.vn' },
]

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    setBanners(FAKE_BANNERS)
  }, [])

  const handleEdit = (record) => {
    setEditingBanner(record)
    form.setFieldsValue(record)
    setImageUrl(record.image)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setBanners(banners.filter((b) => b.id !== id))
    message.success('Đã xóa banner')
  }

  const handleSubmit = (values) => {
    const finalValues = {
      ...values,
      image: imageUrl
    }

    if (editingBanner) {
      setBanners(banners.map((b) => b.id === editingBanner.id ? { ...b, ...finalValues } : b))
    } else {
      setBanners([...banners, { id: Date.now(), ...finalValues }])
    }
    setIsModalOpen(false)
    form.resetFields()
    setImageUrl('')
    message.success('Cập nhật banner thành công')
  }

  const columns = [
    {
      title: 'Ảnh banner',
      dataIndex: 'image',
      render: (src) => <Image width={100} src={src} alt="banner" />,
    },
    {
      title: 'Liên kết khi bấm',
      dataIndex: 'url',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const uploadProps = {
    beforeUpload: (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target.result)
      }
      reader.readAsDataURL(file)
      return false
    },
    showUploadList: false
  }

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">🖼️ Quản lý Banner</h2>
            <Button icon={<PlusOutlined />} onClick={() => { setEditingBanner(null); form.resetFields(); setImageUrl(''); setIsModalOpen(true) }}>
              Thêm banner
            </Button>
          </div>

          <Table rowKey="id" columns={columns} dataSource={banners} pagination={false} bordered />

          <Modal
            title={editingBanner ? 'Cập nhật banner' : 'Thêm banner'}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
              <Form.Item label="Ảnh banner">
                <Upload {...uploadProps} accept="image/*">
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
                {imageUrl && <Image src={imageUrl} alt="preview" className="mt-2 rounded-md" width={200} />}
              </Form.Item>
              <Form.Item name="url" label="Link khi click" rules={[{ required: true, message: 'Nhập URL' }]}> 
                <Input placeholder="https://example.com" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>{editingBanner ? 'Cập nhật' : 'Thêm'}</Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}