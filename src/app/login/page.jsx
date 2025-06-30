'use client'

import { useRouter } from 'next/navigation'
import { Button } from 'antd'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '@/redux/userSlice'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function Login() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [form, setForm] = useState({ emailOrPhone: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    try {
      const res = await API.Auth.login(form)
      if (res?.status === 200) {

        localStorage.setItem('jwt', res?.data?.token)
        router.push('/')
      }
    } catch (error) {
      toast.error('Lỗi đăng nhập: ' + (error )?.message || 'Không rõ lỗi')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-xl w-full max-w-sm p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Email hoặc SĐT</label>
            <input
              type="text"
              name="emailOrPhone"
              required
              value={form.emailOrPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-black"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Mật khẩu</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-black"
              autoComplete="current-password"
            />
          </div>
          <div className="pt-2">
            <Button type="primary" htmlType="submit" block className="!h-10">
              Đăng nhập
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
