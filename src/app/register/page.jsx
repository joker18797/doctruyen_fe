'use client'

import { useRouter } from 'next/navigation'
import { Button, Spin } from 'antd'
import { useState } from 'react'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [IsLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatar(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirm) {
      alert('Mật khẩu không khớp')
      return
    }

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value)
    })
    if (avatar) {
      formData.append('avatar', avatar)
    }

    try {
      setIsLoading(true);
      const res = await API.Auth.register(formData);
      if (res?.status === 201) {
        setIsLoading(false)
        toast.success(res?.data?.message);
        router.push('/login')
      }
    } catch (error) {
      setIsLoading(false)
      toast.error('Lỗi đăng ký: ' + error?.data?.message)
    }
  }

  return (
    <Spin spinning={IsLoading} >
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-md rounded-xl w-full max-w-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-[black]">Đăng ký</h2>
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="block mb-1 text-sm font-medium text-[black]">Họ và tên</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-[black]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[black]">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-[black]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[black]">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-[black]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[black]">Mật khẩu</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-[black]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[black]">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirm"
                required
                value={form.confirm}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-[black]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[black]">Ảnh đại diện</label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-[black]"
              />
            </div>
            <div className="pt-2">
              <Button type="primary" htmlType="submit" block>
                Đăng ký
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Spin>
  )
}
