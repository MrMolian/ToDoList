import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

import { createTask, updateTask } from "../api/Task";
import type {
    Task,
    TaskPriority,
} from "../models/taskModel";

interface TaskEditModalProps {
    open: boolean;
    task: Task | null;
    parentGroupId: string | null;
    parentTask: Task | null;
    onClose: () => void;
    onSaved: (task: Task) => void;
}

const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

const PRIORITY_LABELS = {
    low: "Low",
    medium: "Medium",
    high: "High",
} as const;

export default function TaskEditModal({
    open,
    task,
    parentGroupId,
    parentTask,
    onClose,
    onSaved,
}: TaskEditModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = task !== null;
    const isCreatingSubTask = !isEditing && parentTask !== null;

    useEffect(() => {
        setTitle(task?.title ?? "");
        setDescription(task?.description ?? "");
        setPriority(task?.priority ?? "medium");
        setErrorMessage(null);
        setIsSaving(false);
    }, [task, open]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                priority,
            };

            const updatedTask = task
                ? await updateTask(task.id, payload)
                : await createTask({
                      ...payload,
                      achieved: false,
                      task_parent_id: parentTask?.id ?? null,
                      group_parent_id: parentTask ? null : parentGroupId,
                  });

            onSaved(updatedTask);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Task changes could not be saved.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={isSaving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { className: "mui-glass-dialog__paper" } }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isEditing
                        ? "Edit task"
                        : isCreatingSubTask
                          ? "Create subtask"
                          : "Create task"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                        {isCreatingSubTask ? (
                            <TextField
                                label="Parent task"
                                value={parentTask.title}
                                fullWidth
                                disabled
                            />
                        ) : null}

                        <TextField
                            label="Title"
                            value={title}
                            onChange={(event) => {
                                setTitle(event.target.value);
                            }}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value);
                            }}
                            fullWidth
                            multiline
                            minRows={3}
                        />

                        <TextField
                            select
                            label="Priority"
                            value={priority}
                            onChange={(event) => {
                                setPriority(event.target.value as TaskPriority);
                            }}
                            fullWidth
                        >
                            {TASK_PRIORITIES.map((value) => (
                                <MenuItem key={value} value={value}>
                                    {PRIORITY_LABELS[value]}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSaving}>
                        {isSaving
                            ? isEditing
                                ? "Saving..."
                                : "Creating..."
                            : isEditing
                              ? "Save task"
                              : isCreatingSubTask
                                ? "Create subtask"
                                : "Create task"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
