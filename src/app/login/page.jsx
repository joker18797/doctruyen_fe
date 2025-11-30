'use client'

import { useRouter } from 'next/navigation'
import { Button, Spin } from 'antd'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '@/redux/userSlice'
import API from '@/Service/API'
import { toast } from 'react-toastify'

export default function Login() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [form, setForm] = useState({ emailOrPhone: '', password: '' })
  const [IsLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    try {
      setIsLoading(true);
      const res = await API.Auth.login(form);
      if (res?.status === 200) {
        setIsLoading(false)
        localStorage.setItem('jwt', res?.data?.token)
        router.push('/')
      }
    } catch (error) {
      setIsLoading(false)
      toast.error('Lỗi đăng nhập: ' + error?.data?.message)
    }
  }

  return (
    <Spin spinning={IsLoading} >
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
            <div className="text-center mt-4">
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                Quên mật khẩu?
              </a>
            </div>
          </form>
        </div>
      </div>
    </Spin>
  )
}
