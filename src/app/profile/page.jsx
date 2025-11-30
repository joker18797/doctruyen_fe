'use client'

import { useEffect, useState } from 'react'
import { Input, Button, Upload, Avatar, Spin, Tabs, Form } from 'antd'
import { UploadOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import API from '@/Service/API'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '@/redux/userSlice'
import LayoutHeader from '@/components/LayoutHeader'
import { toast } from 'react-toastify'

export default function ProfilePage() {
    const user = useSelector((state) => state.user.currentUser)
    const dispatch = useDispatch()
    const [IsLoading, setIsLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        avatar: '',
    })
    const [passwordForm] = Form.useForm()

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

    const handleChangePassword = async (values) => {
        try {
            setPasswordLoading(true)
            const res = await API.User.changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            })
            if (res?.status === 200) {
                toast.success('Đổi mật khẩu thành công')
                passwordForm.resetFields()
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || 'Đổi mật khẩu thất bại'
            toast.error(errorMessage)
        } finally {
            setPasswordLoading(false)
        }
    }

    const tabItems = [
        {
            key: 'profile',
            label: (
                <span className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Hồ sơ</span>
                </span>
            ),
            children: (
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar
                            size={80}
                            src={form.avatar ? form.avatar : undefined}
                            icon={!form.avatar && <UserOutlined />}
                            className="border-2 border-blue-200"
                        />
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                className="text-sm mb-2"
                            />
                            <p className="text-xs text-gray-500">Chọn ảnh đại diện mới</p>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">Tên hiển thị</label>
                        <Input 
                            name="name" 
                            value={form.name} 
                            onChange={handleChange}
                            size="large"
                            placeholder="Nhập tên hiển thị"
                        />
                    </div>

                    <div>
                        <Button 
                            type="primary" 
                            onClick={handleSubmit}
                            size="large"
                            className="w-full sm:w-auto"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: 'password',
            label: (
                <span className="flex items-center gap-2">
                    <LockOutlined />
                    <span>Đổi mật khẩu</span>
                </span>
            ),
            children: (
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    className="space-y-4"
                >
                    <Form.Item
                        label="Mật khẩu cũ"
                        name="oldPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu cũ' }
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Nhập mật khẩu cũ"
                            prefix={<LockOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            prefix={<LockOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Nhập lại mật khẩu mới"
                            prefix={<LockOutlined />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            size="large"
                            loading={passwordLoading}
                            className="w-full sm:w-auto"
                        >
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
    ]

    return (
        <Spin spinning={IsLoading}>
            <LayoutHeader />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-lg mb-6 p-6">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <UserOutlined className="text-3xl" />
                            <span>Cài đặt tài khoản</span>
                        </h1>
                        <p className="text-blue-100">Quản lý thông tin và bảo mật tài khoản của bạn</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <Tabs
                            defaultActiveKey="profile"
                            items={tabItems}
                            className="p-6"
                            size="large"
                        />
                    </div>
                </div>
            </div>
        </Spin>
    )
}
