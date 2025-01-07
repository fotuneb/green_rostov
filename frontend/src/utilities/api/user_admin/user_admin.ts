import { sendAPIRequestJSON } from "../index"
import { APIResponseError, APIResponseSuccess } from "../types"
import { UserRole } from "../user/types"

// Работа с админом
export const UserAdmin = {
    changeFullname: async (userId: number, fullname: string): Promise<APIResponseSuccess | APIResponseError> => {
        const res = await sendAPIRequestJSON(`/api/users/admin/change-fullname/${userId}?new_fullname=${fullname}`, 'POST')
        return await res.json()
    },

    changeRole: async (userId: number, newRole: UserRole): Promise<APIResponseSuccess | APIResponseError> => {
        const res = await sendAPIRequestJSON(`/api/users/admin/change-role/${userId}?new_role=${newRole}`, 'POST')
        return await res.json()
    },

    changePassword: async (userId: number, newPassword: string): Promise<APIResponseSuccess | APIResponseError> => {
        const res = await sendAPIRequestJSON(`/api/users/admin/change-password/${userId}?new_password=${newPassword}`, 'POST')
        return await res.json()
    }
}