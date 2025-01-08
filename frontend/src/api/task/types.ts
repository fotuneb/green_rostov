// Базовый тип объекта запроса в категории "Task"
interface _TaskAPIRequestObject {
    id: number,
    title: string,
    index: number,
    author: number,
    assignee: number,
    column_id: number
    column: number,
    created_at: string,
    updated_at: string,
    deadline: null,
    total_tracked_time: number,
    attachments: Array<string>
}

// Тип объекта с полной информацией о таске
export interface TaskAPIRequestObjectFull extends _TaskAPIRequestObject {}

// Тип объекта с частичной информацией о таске
export type TaskAPIRequestObjectPartial = Pick<_TaskAPIRequestObject, 
    'id' | 'title' | 'index' | 'author' | 'assignee' | 'column_id'>






