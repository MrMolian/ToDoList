import type { TaskGroup } from "../models/taskGroupModel";
import supabase from "../utils/supabase";

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

export type CreateTaskGroupInput = Pick<
    TaskGroup,
    "title" | "parent_id" | "description" | "color"
>;

export type UpdateTaskGroupInput = Partial<
    Pick<TaskGroup, "title" | "parent_id" | "description" | "color">
>;

export async function getTaskGroups(): Promise<TaskGroup[]> {
    const { data, error } = await supabase
        .from("task_groups")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        throw error;
    }

    return data as TaskGroup[];
}

export async function createTaskGroup(
    input: CreateTaskGroupInput,
): Promise<TaskGroup> {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
        .from("task_groups")
        .insert({
            user_id: userId,
            parent_id: input.parent_id ?? null,
            title: input.title,
            description: input.description ?? null,
            color: input.color ?? null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as TaskGroup;
}

export async function updateTaskGroup(
    id: string,
    input: UpdateTaskGroupInput,
): Promise<TaskGroup> {
    const { data, error } = await supabase
        .from("task_groups")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as TaskGroup;
}

export async function deleteTaskGroup(id: string): Promise<void> {
    const { error } = await supabase.from("task_groups").delete().eq("id", id);

    if (error) {
        throw error;
    }
}
