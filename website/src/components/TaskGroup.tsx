import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { Link } from "react-router-dom";

import type { TaskGroup } from "../models/taskGroupModel";

interface TaskGroupCardProps {
    taskGroup: TaskGroup;
    href: string;
    childGroupCount: number;
    taskCount: number;
    onEdit: (taskGroup: TaskGroup) => void;
}

export default function TaskGroupCard({
    taskGroup,
    href,
    childGroupCount,
    taskCount,
    onEdit,
}: TaskGroupCardProps) {
    const accent = taskGroup.color || "#7b91ff";

    return (
        <article className="glass-card group-card">
            <div className="group-card__header">
                <div className="group-card__title-wrap">
                    <span
                        className="group-card__swatch"
                        style={{ background: accent }}
                        aria-hidden="true"
                    />
                    <div>
                        <div className="section-label">
                            <FolderRoundedIcon fontSize="inherit" />
                            Task group
                        </div>
                        <h3>{taskGroup.title}</h3>
                    </div>
                </div>

                <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                        onEdit(taskGroup);
                    }}
                    aria-label={`Edit ${taskGroup.title}`}
                >
                    <EditRoundedIcon fontSize="small" />
                </button>
            </div>

            <p className="group-card__description">
                {taskGroup.description || "A focused container for related work."}
            </p>

            <div className="group-card__stats">
                <span>{childGroupCount} nested group{childGroupCount === 1 ? "" : "s"}</span>
                <span>{taskCount} task{taskCount === 1 ? "" : "s"}</span>
            </div>

            <Link to={href} className="group-card__link">
                Open space
                <ArrowOutwardRoundedIcon fontSize="small" />
            </Link>
        </article>
    );
}
