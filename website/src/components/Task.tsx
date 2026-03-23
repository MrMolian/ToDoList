import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import type { Task } from "../models/taskModel";
import SubTask from "./SubTask";

interface TaskCardProps {
    task: Task;
    subTasks: Task[];
    onEdit: (task: Task) => void;
    onAddSubTask: (task: Task) => void;
}

const STATUS_LABELS = {
    todo: "To do",
    in_progress: "In progress",
    done: "Done",
} as const;

const PRIORITY_LABELS = {
    low: "Low",
    medium: "Medium",
    high: "High",
} as const;

export default function TaskCard({
    task,
    subTasks,
    onEdit,
    onAddSubTask,
}: TaskCardProps) {
    return (
        <article className="glass-card task-card">
            <div className="task-card__header">
                <div>
                    <div className="task-card__badges">
                        <span className={`status-pill status-pill--${task.status}`}>
                            {STATUS_LABELS[task.status]}
                        </span>
                        <span
                            className={`priority-pill priority-pill--${task.priority}`}
                        >
                            {PRIORITY_LABELS[task.priority]}
                        </span>
                    </div>
                    <h3>{task.title}</h3>
                </div>

                <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                        onEdit(task);
                    }}
                    aria-label={`Edit ${task.title}`}
                >
                    <EditRoundedIcon fontSize="small" />
                </button>
            </div>

            <p className="task-card__description">
                {task.description || "No additional notes for this task yet."}
            </p>

            <div className="task-card__actions">
                <button
                    type="button"
                    className="secondary-button task-card__action"
                    onClick={() => {
                        onAddSubTask(task);
                    }}
                >
                    <AddRoundedIcon fontSize="small" />
                    Add subtask
                </button>
            </div>

            {subTasks.length > 0 ? (
                <div className="task-card__subtasks">
                    <div className="section-label">
                        {subTasks.length} subtask{subTasks.length > 1 ? "s" : ""}
                    </div>
                    <div className="task-card__subtask-list">
                        {subTasks.slice(0, 3).map((subTask) => (
                            <SubTask key={subTask.id} task={subTask} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="task-card__empty">No subtasks attached.</div>
            )}
        </article>
    );
}
