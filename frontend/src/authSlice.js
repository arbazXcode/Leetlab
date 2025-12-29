
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axiosClient from './utils/axiosClient.js'

// REGISTER
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            // Only send firstName, email, password (backend doesn't accept lastName)
            const { firstName, email, password } = userData;
            const response = await axiosClient.post('/user/register', { firstName, email, password });
            
            // Store token if provided
            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
            }
            
            return response.data; // Should include user data and token
        } catch (error) {
            // Handle network errors
            if (!error.response) {
                return rejectWithValue(
                    "Network error. Please check if the backend server is running on http://localhost:3000"
                )
            }
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

// LOGIN
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/user/login", credentials)
            
            // Store token if provided
            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
            }
            
            return response.data.user
        } catch (error) {
            // Handle network errors
            if (!error.response) {
                return rejectWithValue(
                    "Network error. Please check if the backend server is running on http://localhost:3000"
                )
            }
            return rejectWithValue(
                error.response?.data?.message || error.message || "Login failed"
            )
        }
    }
)

// CHECK AUTH
export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            // Check if token exists before making request
            // Cookie exists automatically, no need to check
            const response = await axiosClient.get("/user/check", { withCredentials: true });
            return response.data.user;
        } catch (error) {
            // Clear token on auth failure
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
            }
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Auth check failed"
            );
        }
    }
);


// LOGOUT
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axiosClient.post("/user/logout")
            return null
        } catch (error) {
            // Even if logout fails on server, we clear local data
            return rejectWithValue(
                error.response?.data?.message || error.message || "Logout failed"
            )
        } finally {
            // Always clear tokens regardless of server response
            localStorage.removeItem('token')
            sessionStorage.removeItem('token')
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        initialized: false
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setInitialized: (state) => {
            state.initialized = true
        },
        // Add manual logout for client-side cleanup
        clearAuth: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            localStorage.removeItem('token')
            sessionStorage.removeItem('token')
        }
    },
    extraReducers: (builder) => {
        builder
            // REGISTER
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = !!action.payload
                state.user = action.payload.user
                state.error = null
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.isAuthenticated = false
                state.user = null
            })

            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload
                state.error = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || "Network error. Please check if the server is running."
                state.isAuthenticated = false
                state.user = null
            })

            // CHECK AUTH
            .addCase(checkAuth.pending, (state) => {
                state.loading = true
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = !!action.payload
                state.user = action.payload
                state.error = null
                state.initialized = true
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.isAuthenticated = false
                state.user = null
                state.initialized = true
            })

            // LOGOUT
            .addCase(logoutUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false
                state.user = null
                state.isAuthenticated = false
                state.error = null
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                // Still clear auth data even on logout error
                state.isAuthenticated = false
                state.user = null
            })
    }
})

export const { clearError, setInitialized, clearAuth } = authSlice.actions
export default authSlice.reducer











// respone me hota hai

// const response = {
//     data: {
//         user: reply,
//         message: "valid user"
//     },
//     status_code
// }















// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
// import axiosClient from './utils/axiosClient.js'

// export const registerUser = createAsyncThunk(
//     "auth/register",
//     async (userData, { rejectWithValue }) => {
//         try {
//             const response = await axiosClient.post("/user/register", userData)
//             return response.data.user
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || error.message || "Something went wrong"
//             )
//         }

//     }
// )


// export const loginUser = createAsyncThunk(
//     "auth/login",
//     async (credentials, { rejectWithValue }) => {
//         try {
//             const response = await axiosClient.post("/user/login", credentials)
//             return response.data.user
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || error.message || "Something went wrong"
//             )
//         }

//     }
// )

// export const checkAuth = createAsyncThunk(
//     "auth/check",
//     async (_, { rejectWithValue }) => {
//         try {
//             const { data } = await axiosClient.get("/user/check")
//             return data.user
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || error.message || "Something went wrong"
//             )
//         }

//     }
// )


// export const logoutUser = createAsyncThunk(
//     "auth/logout",
//     async (_, { rejectWithValue }) => {
//         try {
//             await axiosClient.post("/user/logout")
//             return null
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || error.message || "Something went wrong"
//             )
//         }

//     }
// )

// const authSlice = createSlice({
//     name: "auth",
//     initialState: {
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null
//     },
//     reducers: {

//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(registerUser.pending, (state) => {
//                 state.loading = true;
//                 state.error = null
//             })
//             .addCase(registerUser.fulfilled, (state, action) => {
//                 state.loading = false
//                 state.isAuthenticated = !!action.payload
//                 state.user = action.payload
//             })
//             .addCase(registerUser.rejected, (state, action) => {
//                 state.loading = false
//                 state.error = action.payload   // string message
//                 state.isAuthenticated = false
//                 state.user = null
//             })
//             //login
//             .addCase(loginUser.pending, (state) => {
//                 state.loading = true
//                 state.error = null
//             })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.loading = false
//                 state.isAuthenticated = !!action.payload
//                 state.user = action.payload
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.loading = false
//                 state.error = action.payload?.message || "Something went wrong"
//                 state.isAuthenticated = false
//                 state.user = null
//             })
//             //routes
//             .addCase(checkAuth.pending, (state) => {
//                 state.loading = true;
//                 state.error = null
//             })
//             .addCase(checkAuth.fulfilled, (state, action) => {
//                 state.loading = false
//                 state.isAuthenticated = !!action.payload
//                 state.user = action.payload
//             })
//             .addCase(checkAuth.rejected, (state, action) => {
//                 state.loading = false
//                 state.error = action.payload?.message || "something went wrong"
//                 state.isAuthenticated = false
//                 state.user = null
//             })

//             //logout
//             .addCase(logoutUser.pending, (state) => {
//                 state.loading = true
//                 state.error = null
//             })
//             .addCase(logoutUser.fulfilled, (state) => {
//                 state.loading = false
//                 state.user = null
//                 state.isAuthenticated = false
//                 state.error = null
//             })
//             .addCase(logoutUser.rejected, (state, action) => {
//                 state.loading = false
//                 state.error = action.payload?.message || "something went wrong"
//                 state.isAuthenticated = false
//                 state.user = null
//             })
//     }
// })


// export default authSlice.reducer 