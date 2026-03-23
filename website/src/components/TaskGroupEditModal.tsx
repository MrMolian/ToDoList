import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

import { createTaskGroup, updateTaskGroup } from "../api/TaskGroup";
import type { TaskGroup } from "../models/taskGroupModel";

interface TaskGroupEditModalProps {
    open: boolean;
    taskGroup: TaskGroup | null;
    parentGroupId: string | null;
    onClose: () => void;
    onSaved: (taskGroup: TaskGroup) => void;
}

export default function TaskGroupEditModal({
    open,
    taskGroup,
    parentGroupId,
    onClose,
    onSaved,
}: TaskGroupEditModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#7b91ff");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = taskGroup !== null;

    useEffect(() => {
        setTitle(taskGroup?.title ?? "");
        setDescription(taskGroup?.description ?? "");
        setColor(taskGroup?.color ?? "#7b91ff");
        setErrorMessage(null);
        setIsSaving(false);
    }, [taskGroup, open]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                color: color.trim() || null,
            };

            const updatedTaskGroup = taskGroup
                ? await updateTaskGroup(taskGroup.id, payload)
                : await createTaskGroup({
                      ...payload,
                      parent_id: parentGroupId,
                  });

            onSaved(updatedTaskGroup);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Task group changes could not be saved.",
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
                    {isEditing ? "Edit task group" : "Create task group"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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
                            label="Accent color"
                            type="color"
                            value={color}
                            onChange={(event) => {
                                setColor(event.target.value);
                            }}
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
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
                              ? "Save group"
                              : "Create group"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
