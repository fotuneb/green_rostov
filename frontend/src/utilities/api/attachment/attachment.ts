// Возврат пути к аватарке
export const Attachment = {
    getURL: (attachmentId: number) => {
        return `/api/attachments/${attachmentId}`
    }
}