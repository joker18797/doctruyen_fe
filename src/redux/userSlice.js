import { createSlice } from '@reduxjs/toolkit'

// Lấy user từ localStorage nếu có
const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

const initialState = {
  currentUser: getInitialUser(),
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.currentUser = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload))
      }
    },
    logout: (state) => {
      state.currentUser = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
    },
  },
})

export const { login, logout } = userSlice.actions
export default userSlice.reducer
