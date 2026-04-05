import Checkbox from "@mui/material/Checkbox";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { ListTodo } from "lucide-react";
import { useState } from "react";

import type { Task } from "../models/taskModel";
import SubTask from "./SubTask";

interface TaskCardProps {
    task: Task;
    subTasks: Task[];
    onEdit: (task: Task) => void;
    onAddSubTask: (task: Task) => void;
    onToggleAchieved: (task: Task) => void;
    onToggleSubTaskAchieved: (task: Task) => void;
    onDeleteSubTask: (task: Task) => Promise<void>;
}

const PRIORITY_LABELS = {
    low: "Low",
    medium: "Medium",
    high: "High",
} as const;

const PRIORITY_LEVELS = {
    low: 1,
    medium: 2,
    high: 3,
} as const;

export default function TaskCard({
    task,
    subTasks,
    onEdit,
    onAddSubTask,
    onToggleAchieved,
    onToggleSubTaskAchieved,
    onDeleteSubTask,
}: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <article
            className={`glass-card task-card ${task.achieved ? "task-card--achieved" : ""}`}
        >
            <div className="task-card__row">
                <Checkbox
                    className="task-checkbox"
                    checked={task.achieved}
                    onChange={() => {
                        onToggleAchieved(task);
                    }}
                    inputProps={{
                        "aria-label":
                        task.achieved
                            ? `Mark ${task.title} as not achieved`
                            : `Mark ${task.title} as achieved`,
                    }}
                    disableRipple
                />

                <div className="task-card__main">
                    <div className="task-card__header">
                        <div className="task-card__title-block">
                            <div className="task-card__title-line">
                                <h3>{task.title}</h3>
                                <span
                                    className={`priority-dots priority-dots--${task.priority}`}
                                    aria-label={`${PRIORITY_LABELS[task.priority]} priority`}
                                    title={`${PRIORITY_LABELS[task.priority]} priority`}
                                >
                                    {Array.from({ length: 3 }, (_, index) => (
                                        <span
                                            key={index}
                                            className={`priority-dots__dot ${index < PRIORITY_LEVELS[task.priority] ? "priority-dots__dot--filled" : ""}`}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </span>
                            </div>
                        </div>

                        <div className="task-card__controls">
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => {
                                    onAddSubTask(task);
                                }}
                                aria-label={`Add subtask to ${task.title}`}
                            >
                                <ListTodo size={18} strokeWidth={2} />
                            </button>

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

                            <button
                                type="button"
                                className={`icon-button task-card__expand ${isExpanded ? "task-card__expand--open" : ""}`}
                                onClick={() => {
                                    setIsExpanded((current) => !current);
                                }}
                                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${task.title}`}
                                aria-expanded={isExpanded}
                            >
                                <ExpandMoreRoundedIcon fontSize="small" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded ? (
                <div className="task-card__details">
                    <p className="task-card__description">
                        {task.description || "No additional notes for this task yet."}
                    </p>

                    {subTasks.length > 0 ? (
                        <div className="task-card__subtasks">
                            <div className="section-label">
                                {subTasks.length} subtask{subTasks.length > 1 ? "s" : ""}
                            </div>
                            <div className="task-card__subtask-list">
                                {subTasks.map((subTask) => (
                                    <SubTask
                                        key={subTask.id}
                                        task={subTask}
                                        onToggleAchieved={onToggleSubTaskAchieved}
                                        onDelete={onDeleteSubTask}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="task-card__empty">No subtasks attached.</div>
                    )}
                </div>
            ) : null}
        </article>
    );
}
