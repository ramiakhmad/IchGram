import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {LoginDataType, RegisterDataType, ResetDataType} from '../types/authTypes.ts';
import {axiosInstance} from "../../utils/apiCalls";

export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ username, email, fullName, password }: RegisterDataType, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            await axiosInstance.post(
                `/auth/register`,
                { username, email, fullName, password },
                config
            )
        } catch (error: unknown) {
            // return custom error message from backend if present
            console.log(error)
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data.message) {
                    return rejectWithValue(error.response.data.message)
                } else {
                    return rejectWithValue(error.message)
                }
            }
        }
    }
)

export const userLogin = createAsyncThunk(
    'auth/login',
    async ({ usernameOrEmail, password }: LoginDataType, { rejectWithValue }) => {
        try {
            // configure header's Content-Type as JSON
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            const { data } = await axiosInstance.post(
                `/auth/login`,
                { usernameOrEmail, password },
                config
            )
            return data
        } catch (error: unknown) {
            // return custom error message from API if any

            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data.message) {
                    return rejectWithValue(error.response.data.message)
                } else {
                    return rejectWithValue(error.message)
                }
            }
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/reset',
    async ({ usernameOrEmail }: ResetDataType, { rejectWithValue }) => {
        try {
            // configure header's Content-Type as JSON
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            const { data } = await axiosInstance.post(
                `/auth/reset`,
                { usernameOrEmail },
                config
            )
            return data
        } catch (error: unknown) {
            // return custom error message from API if any

            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data.message) {
                    return rejectWithValue(error.response.data.message)
                } else {
                    return rejectWithValue(error.message)
                }
            }
        }
    }
);