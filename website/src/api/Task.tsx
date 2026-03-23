import supabase from "../utils/supabase";
import type { Task, TaskStatus, TaskPriority } from "../models/taskModel";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type CreateTaskInput = Pick<
    Task,
    | "title"
    | "task_parent_id"
    | "group_parent_id"
    | "description"
    | "status"
    | "priority"
>;

export type UpdateTaskInput = Partial<
    Pick<
        Task,
        | "title"
        | "description"
        | "status"
        | "priority"
        | "task_parent_id"
        | "group_parent_id"
    >
>;

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Fetch all tasks belonging to the authenticated user.
 * Returns a flat list — build your tree on the client using
 * task_parent_id / group_parent_id.
 */
export async function getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Task[];
}

/**
 * Fetch a single task by id.
 */
export async function getTaskById(id: string): Promise<Task> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Task;
}

/**
 * Fetch all tasks that are direct children of a task group.
 */
export async function getTasksByGroup(groupId: string): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("group_parent_id", groupId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Task[];
}

/**
 * Fetch all tasks that are direct children of another task.
 */
export async function getSubTasks(taskId: string): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_parent_id", taskId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Task[];
}

/**
 * Fetch all root-level tasks (no parent task, no parent group).
 */
export async function getRootTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .is("task_parent_id", null)
        .is("group_parent_id", null)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Task[];
}

/**
 * Fetch tasks filtered by status.
 */
export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Task[];
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Create a new task.
 * Provide either task_parent_id (child of a task) or
 * group_parent_id (child of a group) — not both.
 * Leave both null to create a root-level task.
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
    if (input.task_parent_id && input.group_parent_id) {
        throw new Error(
            "A task cannot have both a task parent and a group parent.",
        );
    }

    const { data, error } = await supabase
        .from("tasks")
        .insert({
            task_parent_id: input.task_parent_id ?? null,
            group_parent_id: input.group_parent_id ?? null,
            title: input.title,
            description: input.description ?? null,
            status: input.status ?? "todo",
            priority: input.priority ?? "medium",
        })
        .select()
        .single();

    if (error) throw error;
    return data as Task;
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Update one or more fields of a task.
 * Only the authenticated owner can update (enforced by RLS).
 *
 * To move a task under a group:  { group_parent_id: "<id>", task_parent_id: null }
 * To move a task under a task:   { task_parent_id:  "<id>", group_parent_id: null }
 * To make it root-level:         { task_parent_id: null, group_parent_id: null }
 */
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

    if (error) throw error;
    return data as Task;
}

/**
 * Convenience helper — update only the status of a task.
 */
export async function updateTaskStatus(
    id: string,
    status: TaskStatus,
): Promise<Task> {
    return updateTask(id, { status });
}

/**
 * Convenience helper — update only the priority of a task.
 */
export async function updateTaskPriority(
    id: string,
    priority: TaskPriority,
): Promise<Task> {
    return updateTask(id, { priority });
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Delete a task by id.
 * Child tasks (task_parent_id) will be cascade-deleted by the database.
 */
export async function deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
}
