import { sendAPIRequestJSON } from "../index";

// Работа с комментами
export const Comments = {
    getAll: async (task_id: number) => {
        const res = await sendAPIRequestJSON(`/api/comments/?task_id=${task_id}`, 'GET');
        return await res.json();
    },
    addNewComment: async (text: string, id_user: string, id_task: string) => {
        const res = await sendAPIRequestJSON(`/api/comments`, 'POST', true, {
            text: text,
            id_user: id_user,
            id_task: id_task
        })
        return await res.json();
    },
    deleteComment: async (comment_id: string) => {
        const res = await sendAPIRequestJSON(`/api/comments/${comment_id}`, 'DELETE', true);
        return await res.json();
    },
    changeCommentDescription: async (comment_id: string, newDescription: string) => {
        const res = await sendAPIRequestJSON(`/api/comments/${comment_id}`, 'POST', true, {
            id: comment_id,
            new_text: newDescription
        })
        return await res.json();
    },
    getCommentDescription: async (comment_id: string) => {
        const res = await sendAPIRequestJSON(`/api/comments/${comment_id}`, 'GET');
        return await res.json();
    }
}