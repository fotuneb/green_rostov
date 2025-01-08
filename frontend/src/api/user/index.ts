import {
    sendAPIRequestJSON,
    sendAPIRequestMedia,
    sendAPIRequestURLEncoded
} from "../index"
import type {
    APIResponseSuccess,
    APIResponseError
} from "../types"
import type {
    UserPublicInfoObject,
    UserCreateObject,
    UserLoginObject,
    UserPasswordObject,
    UserCreateAPIResponse,
    UserObjectAPIResponse,
    UserTgLinkAPIResponse,
    UserLoginAPIResponse,
} from "./types"
import type { AttachmentAPIResponse } from "../attachment/types"

// Базовая работа с юзером
export const User = {
    create: async (fullname: string, login: string, password: string): Promise<UserCreateAPIResponse> => {
        const req_body: UserCreateObject = {
            fullname,
            login,
            password1: password
        }
        const res = await sendAPIRequestJSON('/api/users', 'POST', false, req_body)

        return await res.json()
    },

    login: async (username: string, password: string): Promise<UserLoginAPIResponse> => {
        const req_body: UserLoginObject = {
            username,
            password
        }

        const res = await sendAPIRequestURLEncoded('/api/token', 'POST', false, req_body)

        if (res.status === 401)
            throw new Error('Неправильный логин или пароль!')

        if (!res.ok)
            throw new Error('Network response was not ok')

        return await res.json()
    },

    getAll: async (): Promise<UserObjectAPIResponse[]> => {
        const res = await sendAPIRequestJSON('/api/get_users', 'GET')
        return await res.json()
    },

    getById: async (userId: number): Promise<UserObjectAPIResponse> => {
        const res = await sendAPIRequestJSON('/api/get_user/' + userId, 'GET')
        return await res.json()
    },

    getTelegramLink: async (userId: string): Promise<UserTgLinkAPIResponse | APIResponseError> => {
        const res = await sendAPIRequestJSON('/api/tg-link/' + userId, 'GET')
        return await res.json()
    },

    changePublicInfo: async (newInfo: UserPublicInfoObject): Promise<APIResponseSuccess | APIResponseError> => {
        const res = await sendAPIRequestJSON('/api/users/change-info', 'POST', true, newInfo)
        return await res.json()
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<APIResponseSuccess | APIResponseError> => {
        const req_body: UserPasswordObject = {
            current_password: currentPassword,
            new_password: newPassword,
        }

        const res = await sendAPIRequestJSON('/api/users/change-password', 'POST', true, req_body)

        if (res.status === 403)
            throw new Error('Текущий пароль введен неправильно!')

        if (res.status !== 200) {
            const data = await res.json()
            throw new Error(data.detail)
        }

        return await res.json()
    },

    changeAvatar: async (userId: string, file: File): Promise<AttachmentAPIResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await sendAPIRequestMedia('/api/avatar?user_id=' + userId, 'POST', formData, true);
        return await res.json();
    },
} 