import type { Task } from "../models/taskModel";

interface SubTaskProps {
    task: Task;
}

const STATUS_LABELS = {
    todo: "To do",
    in_progress: "In progress",
    done: "Done",
} as const;

export default function SubTask({ task }: SubTaskProps) {
    return (
        <div className="subtask-chip">
            <span
                className={`status-dot status-dot--${task.status}`}
                aria-hidden="true"
            />
            <span className="subtask-chip__title">{task.title}</span>
            <span className="subtask-chip__meta">{STATUS_LABELS[task.status]}</span>
        </div>
    );
}
