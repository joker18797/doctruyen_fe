'use client'

import { useSelector, useDispatch } from 'react-redux'
import { Button, Dropdown, Avatar } from 'antd'
import { UserOutlined, LogoutOutlined, BookOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { logout, login } from '@/redux/userSlice'
import API from '@/Service/API'
import { useEffect, useRef } from 'react'

export default function LayoutHeader() {
    const user = useSelector((state) => state.user.currentUser)
    const dispatch = useDispatch()
    const hasFetched = useRef(false)
    const handleLogout = () => {
        localStorage.removeItem("jwt")
        dispatch(logout())
    }

    const userMenu = {
        items: [
            {
                key: 'my-stories',
                label: (
                    <Link href="/my-stories" className="w-full inline-block">
                        <BookOutlined className="mr-2" />
                        Truyện của tôi
                    </Link>
                ),
            },
            {
                key: 'logout',
                label: (
                    <button onClick={handleLogout} className="w-full text-left">
                        <LogoutOutlined className="mr-2" />
                        Đăng xuất
                    </button>
                ),
            },
        ],
    }

    const getInfoUser = async () => {
        try {
            const res = await API.User.info()
            if (res?.status === 200) {
                dispatch(login(res?.data))
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        if (!hasFetched.current && !user) {
            hasFetched.current = true
            getInfoUser()
        }
    }, [user])
    return (
        <div className="w-full bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
            <Link href="/">
                <div className="text-xl font-bold text-violet-600">📚 TruyenDoc</div>
            </Link>

            {user ? (
                <div className="flex items-center space-x-4">
                    {user.role === 'admin' && (
                        <>
                            <Link href="/admin/users">
                                <Button type="dashed" icon={<UserOutlined />}>
                                    <div className='max-[700px]:hidden'>Quản lý người dùng</div>
                                </Button>
                            </Link>
                            <Link href="/admin/ads">
                                <Button type="dashed" icon={<LinkOutlined />}>
                                    <div className='max-[700px]:hidden'>Quản lý quảng cáo</div>
                                </Button>
                            </Link>
                            <Link href="/admin/banners">
                                <Button type="dashed" icon={<PictureOutlined />}>
                                    <div className="max-[700px]:hidden">Quản lý banner</div>
                                </Button>
                            </Link>
                        </>
                    )}
                    <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                        <div className="cursor-pointer flex items-center space-x-2">
                            <Avatar
                                src={process.env.NEXT_PUBLIC_URL_API + user.avatar}
                                icon={!user.avatar && <UserOutlined />}
                            />
                            <span className="hidden sm:inline text-sm text-gray-700">{user.name}</span>
                        </div>
                    </Dropdown>
                </div>
            ) : (
                <div className="flex space-x-3">
                    <Link href="/login">
                        <Button type="default">Đăng nhập</Button>
                    </Link>
                    <Link href="/register">
                        <Button type="primary">Đăng ký</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
