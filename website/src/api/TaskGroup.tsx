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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type CreateTaskGroupInput = Pick<
    TaskGroup,
    "title" | "parent_id" | "description" | "color"
>;

export type UpdateTaskGroupInput = Partial<
    Pick<TaskGroup, "title" | "parent_id" | "description" | "color">
>;

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Fetch all task groups belonging to the authenticated user.
 * Returns a flat list — build your tree on the client using parent_id.
 */
export async function getTaskGroups(): Promise<TaskGroup[]> {
    const { data, error } = await supabase
        .from("task_groups")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as TaskGroup[];
}

/**
 * Fetch a single task group by id.
 */
export async function getTaskGroupById(id: string): Promise<TaskGroup> {
    const { data, error } = await supabase
        .from("task_groups")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as TaskGroup;
}

/**
 * Fetch all direct children of a task group.
 * Pass null to get all root-level groups (parent_id IS NULL).
 */
export async function getChildTaskGroups(
    parentId: string | null,
): Promise<TaskGroup[]> {
    const query = supabase.from("task_groups").select("*");

    const { data, error } = parentId
        ? await query.eq("parent_id", parentId)
        : await query.is("parent_id", null);

    if (error) throw error;
    return data as TaskGroup[];
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Create a new task group.
 * user_id is automatically set by Supabase via RLS (auth.uid()).
 */
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

    if (error) throw error;
    return data as TaskGroup;
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Update one or more fields of a task group.
 * Only the authenticated owner can update (enforced by RLS).
 */
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

    if (error) throw error;
    return data as TaskGroup;
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Delete a task group by id.
 * Child groups and tasks whose group_parent_id matches will be
 * cascade-deleted by the database automatically.
 */
export async function deleteTaskGroup(id: string): Promise<void> {
    const { error } = await supabase.from("task_groups").delete().eq("id", id);

    if (error) throw error;
}
