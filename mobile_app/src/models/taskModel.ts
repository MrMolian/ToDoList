export type TaskPriority = "low" | "medium" | "high";

export interface Task {
    id: string;
    user_id: string;
    task_parent_id: string | null;
    group_parent_id: string | null;
    title: string;
    description: string | null;
    achieved: boolean;
    priority: TaskPriority;
    created_at: string;
    updated_at: string;
}
