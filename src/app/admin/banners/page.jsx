// pages/admin/banners.js
'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Modal, Input, Form, Upload, message, Popconfirm, Image, Space } from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')
  const [fileUpload, setFileUpload] = useState(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await API.AdminBanner.list()
      setBanners(res.data || [])
    } catch (err) {
      toast.error('Không thể tải danh sách banner')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditingBanner(record)
    form.setFieldsValue(record)
    setImageUrl(process.env.NEXT_PUBLIC_URL_API + record.image)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await API.AdminBanner.delete(id)
      toast.success('Đã xóa banner')
      fetchBanners()
    } catch (err) {
      toast.error('Xóa banner thất bại')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData()
      formData.append('url', values.url)

      if (fileUpload) {
        formData.append('image', fileUpload)
      }

      if (editingBanner) {
        await API.AdminBanner.update(editingBanner._id, formData)
        toast.success('Cập nhật banner thành công')
      } else {
        if (!fileUpload) {
          return toast.error('Vui lòng chọn ảnh banner')
        }
        await API.AdminBanner.create(formData)
        toast.success('Thêm banner thành công')
      }

      fetchBanners()
      setIsModalOpen(false)
      setImageUrl('')
      setFileUpload(null)
      form.resetFields()
    } catch (err) {
      toast.error('Lỗi khi gửi dữ liệu')
    }
  }

  const uploadProps = {
    beforeUpload: (file) => {
      setFileUpload(file)
      setImageUrl(URL.createObjectURL(file))
      return false
    },
    showUploadList: false
  }

  const columns = [
    {
      title: 'Ảnh banner',
      dataIndex: 'image',
      render: (src) => <Image width={100} src={process.env.NEXT_PUBLIC_URL_API + src} alt="banner" />,
    },
    {
      title: 'Liên kết khi bấm',
      dataIndex: 'url',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
            <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">🖼️ Quản lý Banner</h2>
            <Button icon={<PlusOutlined />} onClick={() => {
              setEditingBanner(null)
              form.resetFields()
              setImageUrl('')
              setFileUpload(null)
              setIsModalOpen(true)
            }}>
              Thêm banner
            </Button>
          </div>

          <Table rowKey="_id" columns={columns} dataSource={banners} pagination={false} bordered loading={loading} />

          <Modal
            title={editingBanner ? 'Cập nhật banner' : 'Thêm banner'}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            width={600}
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
                <Button type="primary" htmlType="submit" block>
                  {editingBanner ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}
