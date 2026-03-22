'use client'

import { useCallback, useEffect, useState } from 'react'
import { Table, Tag, Button, Space, Spin, Input, Select, Switch } from 'antd'
import { PushpinOutlined, EyeOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LayoutHeader from '@/components/LayoutHeader'
import API from '@/Service/API'
import { toast } from 'react-toastify'

const pageSize = 15

const PIN_FILTER = {
  all: 'all',
  pinned: 'pinned',
  unpinned: 'unpinned',
}

export default function AdminPinnedStoriesPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pinFilter, setPinFilter] = useState(PIN_FILTER.all)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pinSaving, setPinSaving] = useState({})

  const loadStories = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: pageSize,
        sort: '-createdAt',
      }
      const q = search.trim()
      if (q) params.search = q
      if (pinFilter === PIN_FILTER.pinned) params.pin = true
      if (pinFilter === PIN_FILTER.unpinned) params.pin = false

      const res = await API.Story.list(params)
      setStories(res.data?.data || [])
      setTotal(res.data?.pagination?.total || 0)
    } catch (err) {
      toast.error('Không thể tải danh sách truyện')
    } finally {
      setLoading(false)
    }
  }, [page, pinFilter, search])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  const applySearch = (value) => {
    setPage(1)
    setSearch((value ?? searchInput).trim())
  }

  const handlePinFilterChange = (value) => {
    setPage(1)
    setPinFilter(value)
  }

  const handlePinChange = async (record, checked) => {
    const id = record._id
    setPinSaving((prev) => ({ ...prev, [id]: true }))
    try {
      const formData = new FormData()
      formData.append('pin', checked ? 'true' : 'false')
      await API.Story.update(id, formData)
      toast.success(checked ? 'Đã ghim truyện' : 'Đã bỏ ghim')
      await loadStories()
    } catch (err) {
      toast.error('Không thể cập nhật ghim')
    } finally {
      setPinSaving((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

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
      width: 100,
      render: (_, record) => (
        <Switch
          checked={!!record.pin}
          loading={!!pinSaving[record._id]}
          onChange={(checked) => handlePinChange(record, checked)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
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
            <h1 className="text-2xl font-bold text-gray-800 m-0">Quản lý truyện ghim</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Lọc theo trạng thái ghim, tìm theo tên; bật/tắt ghim trực tiếp trên bảng (hiển thị ở slider nổi bật khi
            ghim).
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <Select
              value={pinFilter}
              onChange={handlePinFilterChange}
              className="min-w-[200px]"
              options={[
                { value: PIN_FILTER.all, label: 'Tất cả truyện' },
                { value: PIN_FILTER.pinned, label: 'Đang ghim' },
                { value: PIN_FILTER.unpinned, label: 'Chưa ghim' },
              ]}
            />
            <Input.Search
              allowClear
              placeholder="Tìm theo tên truyện..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={applySearch}
              onClear={() => {
                setSearchInput('')
                setPage(1)
                setSearch('')
              }}
              enterButton={<SearchOutlined />}
              className="max-w-md"
            />
          </div>

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
              locale={{ emptyText: 'Không có truyện nào' }}
            />
          </Spin>
        </div>
      </div>
    </div>
  )
}
