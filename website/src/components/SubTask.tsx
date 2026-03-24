import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";

import type { Task } from "../models/taskModel";

interface SubTaskProps {
    task: Task;
    onToggleAchieved: (task: Task) => void;
    onDelete: (task: Task) => Promise<void>;
}

export default function SubTask({
    task,
    onToggleAchieved,
    onDelete,
}: SubTaskProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        const shouldDelete = window.confirm(`Delete "${task.title}"?`);

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);

        try {
            await onDelete(task);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="subtask-chip">
            <Checkbox
                className="subtask-checkbox"
                checked={task.achieved}
                onChange={() => {
                    onToggleAchieved(task);
                }}
                disabled={isDeleting}
                inputProps={{
                    "aria-label":
                        task.achieved
                            ? `Mark ${task.title} as not achieved`
                            : `Mark ${task.title} as achieved`,
                }}
                disableRipple
            />
            <span className="subtask-chip__title">{task.title}</span>
            <button
                type="button"
                className="icon-button subtask-chip__delete"
                onClick={() => {
                    void handleDelete();
                }}
                disabled={isDeleting}
                aria-label={`Delete ${task.title}`}
            >
                <DeleteOutlineRoundedIcon fontSize="small" />
            </button>
        </div>
    );
}
