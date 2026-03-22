'use client'

import { useEffect, useState } from 'react'
import { Table, Tag, Button, Space, Spin } from 'antd'
import { PushpinOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

const pageSize = 15

export default function AdminPinnedStoriesPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchPinned = async (p = 1) => {
    try {
      setLoading(true)
      const res = await API.Story.list({
        pin: true,
        page: p,
        limit: pageSize,
        sort: '-createdAt',
      })
      setStories(res.data?.data || [])
      setTotal(res.data?.pagination?.total || 0)
    } catch (err) {
      toast.error('Không thể tải danh sách truyện ghim')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPinned(page)
  }, [page])

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Link href={`/story/${record._id}`} className="text-blue-600 hover:underline font-medium">
          {title}
        </Link>
      ),
    },
    {
      title: 'Tác giả',
      key: 'author',
      render: (_, record) => record.authorName || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const map = {
          published: { color: 'green', label: 'Đã xuất bản' },
          draft: { color: 'default', label: 'Nháp' },
          ongoing: { color: 'blue', label: 'Đang ra' },
          completed: { color: 'purple', label: 'Hoàn thành' },
        }
        const m = map[status] || { color: 'default', label: status || '—' }
        return <Tag color={m.color}>{m.label}</Tag>
      },
    },
    {
      title: 'Lượt đọc',
      dataIndex: 'totalRead',
      key: 'totalRead',
      width: 110,
      render: (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : '0'),
    },
    {
      title: 'Ghim',
      key: 'pin',
      width: 90,
      render: () => (
        <Tag color="gold" icon={<PushpinOutlined />}>
          Có
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Link href={`/story/${record._id}`}>
            <Button size="small" icon={<EyeOutlined />}>
              Xem
            </Button>
          </Link>
          <Link href={`/story/edit/${record._id}`}>
            <Button size="small" type="primary" ghost icon={<EditOutlined />}>
              Sửa
            </Button>
          </Link>
        </Space>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <PushpinOutlined className="text-xl text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-800 m-0">Truyện đang ghim</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Các truyện có <code className="text-sm bg-gray-200 px-1 rounded">pin: true</code> (hiển thị ở slider nổi bật).
          </p>
          <Spin spinning={loading}>
            <Table
              rowKey="_id"
              dataSource={stories}
              columns={columns}
              bordered
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: false,
                onChange: (p) => setPage(p),
                showTotal: (t) => `Tổng ${t} truyện`,
              }}
              scroll={{ x: true }}
              locale={{ emptyText: 'Chưa có truyện nào được ghim' }}
            />
          </Spin>
        </div>
      </div>
    </div>
  )
}
