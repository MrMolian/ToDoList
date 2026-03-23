export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    id: string;
    user_id: string;
    /** Set when this task is a child of another task. */
    task_parent_id: string | null;
    /** Set when this task is a child of a task group. */
    group_parent_id: string | null;
    title: string;
    description: string | null;
    achieved: boolean;
    priority: TaskPriority;
    created_at: string;
    updated_at: string;
}
