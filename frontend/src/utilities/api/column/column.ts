// Работа с колонками
export const Column = {
    getAll: async () => {
        const res = await sendAPIRequestJSON('/api/columns', 'GET')
        return await res.json()
    },

    delete: async (columnId) => {
        const res = await sendAPIRequestJSON('/api/column/' + columnId, 'DELETE')
        return await res.json()
    },

    create: async (title) => {
        const res = await sendAPIRequestJSON('/api/column/?title=' + title, 'PUT')
        return await res.json()
    },

    move: async (columnId, newIndex) => {
        const res = await sendAPIRequestJSON('/api/columns/move', 'PUT', true, {
            column_id: columnId,
            new_index: newIndex
        })

        return await res.json()
    }
}