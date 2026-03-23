import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { Link } from "react-router-dom";

import type { TaskGroup } from "../models/taskGroupModel";

interface BreadcrumbsProps {
    path: TaskGroup[];
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
    return (
        <nav className="breadcrumbs-nav" aria-label="Task group breadcrumbs">
            <Link to="/dashboard" className="breadcrumbs-nav__item">
                <HomeRoundedIcon fontSize="inherit" />
                Root
            </Link>

            {path.map((group, index) => {
                const href = `/dashboard/${path
                    .slice(0, index + 1)
                    .map((item) => item.id)
                    .join("/")}`;

                return (
                    <span key={group.id} className="breadcrumbs-nav__segment">
                        <ChevronRightRoundedIcon fontSize="inherit" />
                        <Link to={href} className="breadcrumbs-nav__item">
                            {group.title}
                        </Link>
                    </span>
                );
            })}
        </nav>
    );
}
