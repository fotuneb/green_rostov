import { APIResponseError, APIResponseSuccess } from "@api/types"

// Базовый тип объекта запроса в категории "Task"
interface _TaskAPIRequestObject {
    id: number,
    title: string,
    index: number,
    author: number,
    assignee: number,
    column_id: number
    column: number,
    description: string,
    created_at: string,
    updated_at: string,
    deadline: null,
    total_tracked_time: number,
    attachments: Array<string>
}

// Тип объекта с полной информацией о таске
interface TaskAPIRequestObjectFull extends _TaskAPIRequestObject { }

// Тип объекта с частичной информацией о таске
type TaskPartial = Pick<_TaskAPIRequestObject,
    'id' | 'title' | 'index' | 'author' | 'assignee' | 'column_id'>


type TaskCreateAPIResponseObject = {
    id: number,
    index: number,
    description: string,
    author: number,
    assignee: number,
    column: number,
    deadline: string | null
}

// Типы объектов запросов для категории "Task"
export type TaskChangeDescRequestObject = {
    id: number
    desc: string
}
export type TaskCreateRequestObject = {
    title: string,
    id_column: number,
    description: string
}

// Типы ответов от сервера в категории "Task"
export type TaskPartialList = Promise<TaskPartial[] | APIResponseError<"Cannot get list of tasks">>
export type TaskFull = Promise<TaskAPIRequestObjectFull | APIResponseError<"Cannot get task with given ID">>
export type TaskRenameAPIResponse = Promise<APIResponseSuccess<{ title: string; }>
    | APIResponseError<"Task not found">>
export type TaskChangeDescAPIResponse = Promise<APIResponseSuccess<{ "description": string }>
    | APIResponseError<"description not found">>
export type TaskChangeResponsibleAPIResponse = Promise<APIResponseSuccess<{
    "msg": "assignee updated successully, but new_assignee have not a tg"
}>
    | APIResponseError<[]>>
export type CreatedTask = Promise<TaskCreateAPIResponseObject | APIResponseError<"Task was not created">>






