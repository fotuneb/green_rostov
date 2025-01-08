import { sendAPIRequestJSON } from "../index"
import { CreatedTask, TaskChangeDescAPIResponse, 
         TaskChangeDescRequestObject, 
         TaskChangeResponsibleAPIResponse, 
         TaskCreateRequestObject, 
         TaskFull, 
         TaskPartialList, 
         TaskRenameAPIResponse } from "./types"

// Работа с тасками
export const Task = {
    getAll: async (): TaskPartialList => {
        const res = await sendAPIRequestJSON('/api/tasks', 'GET')
        return await res.json()
    },

    getById: async (taskId: number): TaskFull  => {
        const res = await sendAPIRequestJSON('/api/task/' + taskId, 'GET')
        return await res.json()
    },

    rename: async (taskId: number, newTitle: string): TaskRenameAPIResponse => {
        const res = await sendAPIRequestJSON('/api/task/rename/', 'POST', true, {
            id: taskId,
            new_title: newTitle
        })

        return await res.json()
    },

    changeDescription: async (taskId: number, newDesc: string): TaskChangeDescAPIResponse => {
        const req_body: TaskChangeDescRequestObject = {
            id: taskId,
            desc: newDesc
        }
        
        const res = await sendAPIRequestJSON('/api/task/change_contents/', 'POST', true, req_body)

        return await res.json()
    },

    changeResponsible: async (taskId: number, responsibleUserId: string): TaskChangeResponsibleAPIResponse => {
        const res = await sendAPIRequestJSON('/api/task/change_responsible/', 'POST', true, {
            id: taskId,
            id_user: responsibleUserId
        })

        return await res.json()
    },

    changeDeadline: async (taskId: number, newDeadline: string) => {
        const res = await sendAPIRequestJSON(`/api/tasks/${taskId}/deadline?new_deadline=${newDeadline}`, 'POST')
        return await res.json()
    },

    delete: async (taskId: number) => {
        const res = await sendAPIRequestJSON('/api/task/' + taskId, 'DELETE')
        return await res.json()
    },

    move: async (taskId: number, newColumnId: number, newIndex: number) => {
        const res = await sendAPIRequestJSON('/api/tasks/move', 'PUT', true, {
            task_id: taskId,
            new_column_id: newColumnId,
            new_index: newIndex,
        })

        return await res.json()
    },

    create: async (title: string, columnId: number): CreatedTask => {
        const req_body: TaskCreateRequestObject = {
            title,
            id_column: columnId,
            description: ''
        }

        const res = await sendAPIRequestJSON('/api/task', 'PUT', true, req_body)

        return await res.json()
    },

    trackTime: async (taskId: number, trackDate: string, trackAmount: number) => {
        const res = await sendAPIRequestJSON('/api/task/track_time', 'PUT', true, {
            task: taskId,
            track_date: trackDate,
            track_amount: trackAmount
        })

        return await res.json()
    }
}
