'use client'

import { useEffect, useState } from 'react'
import { Input, Button, Upload, Avatar, Spin } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '@/redux/userSlice'
import LayoutHeader from '@/components/LayoutHeader'
import { toast } from 'react-toastify'

export default function ProfilePage() {
    const user = useSelector((state) => state.user.currentUser)
    const dispatch = useDispatch()
    const [IsLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        avatar: '',
    })

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', avatar: user.avatar || '' })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append('avatar', file)

        try {
            setIsLoading(true);
            const res = await API.User.uploadAvatar(formData)
            if (res?.status === 200) {
                setIsLoading(false)
                setForm((prev) => ({ ...prev, avatar: res.data.avatar }))
                dispatch(login(res.data?.data))
                toast.success('Cập nhật ảnh đại diện thành công')
            }
        } catch (err) {
            setIsLoading(false)
            toast.error('Lỗi khi tải ảnh lên')
        }
    }

    const handleSubmit = async () => {
        try {
            const res = await API.User.updateProfile({ name: form.name })
            if (res?.status === 200) {
                toast.success('Cập nhật hồ sơ thành công')
                dispatch(login(res.data?.data))
            }
        } catch (err) {
            setIsLoading(false)
            toast.error('Cập nhật thất bại')
        }
    }

    return (
        <Spin spinning={IsLoading} >
            <LayoutHeader />
            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800">👤 Hồ sơ người dùng</h1>

                    <div className="flex items-center space-x-4">
                        <Avatar
                            size={64}
                            src={form.avatar ? process.env.NEXT_PUBLIC_URL_API + form.avatar : undefined}
                            icon={!form.avatar && <UserOutlined />}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="text-sm"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Tên hiển thị</label>
                        <Input name="name" value={form.name} onChange={handleChange} />
                    </div>

                    <div>
                        <Button type="primary" onClick={handleSubmit}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </div>
        </Spin>
    )
}
