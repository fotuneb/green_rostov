const publicURL = process.env.REACT_APP_PUBLIC_URL;
import { getCookie } from './cookies'


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
    }
}

export const Task = {
    getAll: async () => {
        const res = await sendAPIRequestJSON('/api/tasks', 'GET')
        return await res.json()
    }
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