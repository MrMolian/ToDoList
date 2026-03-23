import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import type { Task } from "../models/taskModel";

interface SubTaskProps {
    task: Task;
    onToggleAchieved: (task: Task) => void;
}

export default function SubTask({ task, onToggleAchieved }: SubTaskProps) {
    return (
        <div className="subtask-chip">
            <button
                type="button"
                className={`tick-button tick-button--subtask ${task.achieved ? "tick-button--achieved" : ""}`}
                onClick={() => {
                    onToggleAchieved(task);
                }}
                aria-label={
                    task.achieved
                        ? `Mark ${task.title} as not achieved`
                        : `Mark ${task.title} as achieved`
                }
            >
                {task.achieved ? (
                    <CheckCircleRoundedIcon fontSize="small" />
                ) : (
                    <RadioButtonUncheckedRoundedIcon fontSize="small" />
                )}
            </button>
            <span className="subtask-chip__title">{task.title}</span>
            <span className="subtask-chip__meta">
                {task.achieved ? "Achieved" : "Pending"}
            </span>
        </div>
    );
}
