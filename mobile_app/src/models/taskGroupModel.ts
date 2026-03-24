export interface TaskGroup {
    id: string;
    user_id: string;
    parent_id: string | null;
    title: string;
    description: string | null;
    color: string | null;
    created_at: string;
    updated_at: string;
}
