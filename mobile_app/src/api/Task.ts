import supabase from "../utils/supabase";
import type { Task, TaskPriority } from "../models/taskModel";

async function getAuthenticatedUserId(): Promise<string> {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!user) {
        throw new Error("No authenticated user found.");
    }

    return user.id;
}

export type CreateTaskInput = Pick<
    Task,
    | "title"
    | "task_parent_id"
    | "group_parent_id"
    | "description"
    | "achieved"
    | "priority"
>;

export type UpdateTaskInput = Partial<
    Pick<
        Task,
        | "title"
        | "description"
        | "achieved"
        | "priority"
        | "task_parent_id"
        | "group_parent_id"
    >
>;

export async function getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        throw error;
    }

    return data as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
    if (input.task_parent_id && input.group_parent_id) {
        throw new Error(
            "A task cannot have both a task parent and a group parent.",
        );
    }

    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
        .from("tasks")
        .insert({
            user_id: userId,
            task_parent_id: input.task_parent_id ?? null,
            group_parent_id: input.group_parent_id ?? null,
            title: input.title,
            description: input.description ?? null,
            achieved: input.achieved ?? false,
            priority: input.priority ?? "medium",
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Task;
}

export async function updateTask(
    id: string,
    input: UpdateTaskInput,
): Promise<Task> {
    if (input.task_parent_id && input.group_parent_id) {
        throw new Error(
            "A task cannot have both a task parent and a group parent.",
        );
    }

    const { data, error } = await supabase
        .from("tasks")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as Task;
}

export async function updateTaskAchieved(
    id: string,
    achieved: boolean,
): Promise<Task> {
    return updateTask(id, { achieved });
}

export async function updateTaskPriority(
    id: string,
    priority: TaskPriority,
): Promise<Task> {
    return updateTask(id, { priority });
}

export async function deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
        throw error;
    }
}
