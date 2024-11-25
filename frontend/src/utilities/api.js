import { getCookie } from './cookies'
const publicURL = process.env.REACT_APP_PUBLIC_URL;


const sendAPIRequestJSON = async (relativeUrl, method, authorized = true, body = undefined) => {
    const headers = {}

    if (authorized)
        headers['Authorization'] = 'Bearer ' + getCookie('token')

    if (body)
        headers['Content-Type'] = 'application/json'

    return await fetch(publicURL + relativeUrl, {
        method,
        headers,
        body: JSON.stringify(body)
    })
}

const sendAPIRequestURLEncoded = async (relativeUrl, method, authorized = true, body = undefined) => {
    const headers = {}

    if (authorized)
        headers['Authorization'] = 'Bearer ' + getCookie('token')

    const searchParams = new URLSearchParams();

    if (body) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        for (const key in body)
            searchParams.append(key, body[key])
    }

    return await fetch(publicURL + relativeUrl, {
        method,
        headers,
        body: searchParams.toString()
    })
}

export const User = {
    create: async (fullname, login, password) => {
        const res = await sendAPIRequestJSON('/api/users', 'POST', false, {
            fullname,
            login,
            password1: password
        })

        return await res.json()
    },

    login: async (username, password) => {
        const res = await sendAPIRequestURLEncoded('/api/token', 'POST', false, {
            username,
            password
        })

        if (res.status == 401)
            throw new Error('Неправильный логин или пароль!')

        if (!res.ok)
            throw new Error('Network response was not ok')

        return await res.json()
    },

    getAll: async () => {
        const res = await sendAPIRequestJSON('/api/get_users', 'GET')
        return await res.json()
    },

    getById: async (userId) => {
        const res = await sendAPIRequestJSON('/api/get_user/' + userId, 'GET')
        return await res.json()
    },

    getTelegramLink: async (userId) => {
        const res = await sendAPIRequestJSON('/api/tg-link/' + userId, 'GET')
        return await res.json()
    },

    changePublicInfo: async (newInfo) => {
        const res = await sendAPIRequestJSON('/api/users/change-info', 'POST', true, newInfo)
        return await res.json()
    },
    
    changePassword: async (currentPassword, newPassword) => {
        const res = await sendAPIRequestJSON('/api/users/change-password', 'POST', true, {
            current_password: currentPassword,
            new_password: newPassword,
        })

        if (res.status === 403)
            throw new Error('Текущий пароль введен неправильно!')

        if (res.status !== 200) {
            const data = await res.json()
            throw new Error(data.detail)
        }

        return await res.json()
    }
}

export const UserAdmin = {
    changeFullname: async (userId, fullname) => {
        const res = await sendAPIRequestJSON(`/api/users/admin/change-fullname/${userId}?new_fullname=${fullname}`, 'POST')
        return await res.json()
    },

    changeRole: async (userId, newRole) => {
        const res = sendAPIRequestJSON(`/api/users/admin/change-role/${userId}?new_role=${newRole}`, 'POST')
        return await res.json()
    },

    changePassword: async (userId, newPassword) => {
        const res = sendAPIRequestJSON(`/api/users/admin/change-password/${userId}?new_password=${newPassword}`, 'POST')
        return await res.json()
    }
}

export const Task = {
    getAll: async () => {
        const res = await sendAPIRequestJSON('/api/tasks', 'GET')
        return await res.json()
    },

    getById: async (taskId) => {
        const res = await sendAPIRequestJSON('/api/task/' + taskId, 'GET')
        return await res.json()
    },

    rename: async (taskId, newTitle) => {
        const res = await sendAPIRequestJSON('/api/task/rename', 'POST', true, {
            id: taskId,
            new_title: newTitle
        })

        return await res.json()
    },

    changeDescription: async (taskId, newDesc) => {
        const res = await sendAPIRequestJSON('/api/task/change_contents', 'POST', true, {
            id: taskId,
            desc: newDesc
        })

        return await res.json()
    },

    changeResponsible: async (taskId, responsibleUserId) => {
        const res = await sendAPIRequestJSON('/api/task/change_responsible', 'POST', true, {
            id: taskId,
            id_user: responsibleUserId
        })

        return await res.json()
    },

    delete: async (taskId) => {
        const res = await sendAPIRequestJSON('/api/task/' + taskId, 'DELETE')
        return await res.json()
    },

    move: async (taskId, newColumnId, newIndex) => {
        const res = await sendAPIRequestJSON('/api/tasks/move', 'PUT', true, {
            task_id: taskId,
            new_column_id: newColumnId,
            new_index: newIndex,
        })

        return await res.json()
    },
}

export const Column = {
    getAll: async () => {
        const res = await sendAPIRequestJSON('/api/columns', 'GET')
        return await res.json()
    }
}

export var Board = {
    fetch: async () => {
        let columns = await Column.getAll()
        const tasks = await Task.getAll()
        const users = await User.getAll()

        let idxToCol = {};
        for (let column of columns) {
            column.tasks = []
            column.id = column.id + ''
            idxToCol[column.id] = column
        }

        let userIdToName = {}
        for (const user of users)
            userIdToName[user.id] = user.fullname


        for (let task of tasks) {
            task.id = task.id + ''
            task.assigneeName = userIdToName[task.assignee]
            task.authorName = userIdToName[task.author]
            let columnData = idxToCol[task.column_id]
            if (!columnData)
                continue

            columnData.tasks.push(task);
        }

        for (let column of columns)
            column.tasks.sort((a, b) => a.index - b.index)

        return columns
    }
}