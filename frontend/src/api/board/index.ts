import { User, Task, Column } from '@api'

// Работа с досками
export const Board = {
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