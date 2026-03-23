import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getTasks, updateTaskAchieved } from "../api/Task";
import { getTaskGroups } from "../api/TaskGroup";
import Breadcrumbs from "../components/Breadcrumbs";
import TaskCard from "../components/Task";
import TaskEditModal from "../components/TaskEditModal";
import TaskGroupCard from "../components/TaskGroup";
import TaskGroupEditModal from "../components/TaskGroupEditModal";
import type { Task } from "../models/taskModel";
import type { TaskGroup } from "../models/taskGroupModel";

function buildPath(taskGroups: TaskGroup[], pathIds: string[]) {
    const taskGroupsMap = new Map(taskGroups.map((taskGroup) => [taskGroup.id, taskGroup]));
    const path: TaskGroup[] = [];
    let expectedParentId: string | null = null;

    for (const taskGroupId of pathIds) {
        const taskGroup = taskGroupsMap.get(taskGroupId);

        if (!taskGroup || taskGroup.parent_id !== expectedParentId) {
            return { isValid: false, path: [] as TaskGroup[] };
        }

        path.push(taskGroup);
        expectedParentId = taskGroup.id;
    }

    return { isValid: true, path };
}

function collectTaskDescendantIds(tasks: Task[], rootTaskId: string): Set<string> {
    const ids = new Set<string>([rootTaskId]);
    let changed = true;

    while (changed) {
        changed = false;

        for (const task of tasks) {
            if (task.task_parent_id && ids.has(task.task_parent_id) && !ids.has(task.id)) {
                ids.add(task.id);
                changed = true;
            }
        }
    }

    return ids;
}

function collectTaskGroupDescendantIds(
    taskGroups: TaskGroup[],
    rootTaskGroupId: string,
): Set<string> {
    const ids = new Set<string>([rootTaskGroupId]);
    let changed = true;

    while (changed) {
        changed = false;

        for (const taskGroup of taskGroups) {
            if (
                taskGroup.parent_id &&
                ids.has(taskGroup.parent_id) &&
                !ids.has(taskGroup.id)
            ) {
                ids.add(taskGroup.id);
                changed = true;
            }
        }
    }

    return ids;
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const params = useParams();
    const pathIds = (params["*"] ?? "").split("/").filter(Boolean);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [subTaskParent, setSubTaskParent] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskGroupModalOpen, setIsTaskGroupModalOpen] = useState(false);
    const [selectedTaskGroup, setSelectedTaskGroup] = useState<TaskGroup | null>(
        null,
    );

    useEffect(() => {
        let isActive = true;

        async function loadDashboardData() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const [nextTasks, nextTaskGroups] = await Promise.all([
                    getTasks(),
                    getTaskGroups(),
                ]);

                if (!isActive) {
                    return;
                }

                setTasks(nextTasks);
                setTaskGroups(nextTaskGroups);
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Dashboard data could not be loaded.",
                );
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        void loadDashboardData();

        return () => {
            isActive = false;
        };
    }, []);

    const { isValid, path } = buildPath(taskGroups, pathIds);
    const currentTaskGroup = path[path.length - 1] ?? null;
    const currentTaskGroupId = currentTaskGroup?.id ?? null;

    function openCreateTaskModal() {
        setSelectedTask(null);
        setSubTaskParent(null);
        setIsTaskModalOpen(true);
    }

    function openEditTaskModal(task: Task) {
        setSelectedTask(task);
        setSubTaskParent(null);
        setIsTaskModalOpen(true);
    }

    function openCreateSubTaskModal(task: Task) {
        setSelectedTask(null);
        setSubTaskParent(task);
        setIsTaskModalOpen(true);
    }

    function closeTaskModal() {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        setSubTaskParent(null);
    }

    function openCreateTaskGroupModal() {
        setSelectedTaskGroup(null);
        setIsTaskGroupModalOpen(true);
    }

    function openEditTaskGroupModal(taskGroup: TaskGroup) {
        setSelectedTaskGroup(taskGroup);
        setIsTaskGroupModalOpen(true);
    }

    function closeTaskGroupModal() {
        setIsTaskGroupModalOpen(false);
        setSelectedTaskGroup(null);
    }

    async function handleToggleTaskAchieved(task: Task) {
        try {
            const updatedTask = await updateTaskAchieved(task.id, !task.achieved);

            setTasks((currentTasks) =>
                currentTasks.map((candidate) =>
                    candidate.id === updatedTask.id ? updatedTask : candidate,
                ),
            );
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Task completion could not be updated.",
            );
        }
    }

    function handleDeletedTask(deletedTask: Task) {
        setTasks((currentTasks) => {
            const deletedTaskIds = collectTaskDescendantIds(
                currentTasks,
                deletedTask.id,
            );

            return currentTasks.filter((task) => !deletedTaskIds.has(task.id));
        });
        setErrorMessage(null);
    }

    function handleDeletedTaskGroup(deletedTaskGroup: TaskGroup) {
        const deletedTaskGroupIds = collectTaskGroupDescendantIds(
            taskGroups,
            deletedTaskGroup.id,
        );

        setTaskGroups((currentTaskGroups) =>
            currentTaskGroups.filter(
                (taskGroup) => !deletedTaskGroupIds.has(taskGroup.id),
            ),
        );

        setTasks((currentTasks) => {
            const deletedTaskIds = new Set(
                currentTasks
                    .filter(
                        (task) =>
                            task.group_parent_id &&
                            deletedTaskGroupIds.has(task.group_parent_id),
                    )
                    .map((task) => task.id),
            );

            let changed = true;

            while (changed) {
                changed = false;

                for (const task of currentTasks) {
                    if (
                        task.task_parent_id &&
                        deletedTaskIds.has(task.task_parent_id) &&
                        !deletedTaskIds.has(task.id)
                    ) {
                        deletedTaskIds.add(task.id);
                        changed = true;
                    }
                }
            }

            return currentTasks.filter((task) => !deletedTaskIds.has(task.id));
        });

        setErrorMessage(null);

        if (currentTaskGroup?.id === deletedTaskGroup.id) {
            const parentPathIds = pathIds.slice(0, -1);
            const nextPath = parentPathIds.length
                ? `/dashboard/${parentPathIds.join("/")}`
                : "/dashboard";

            navigate(nextPath, { replace: true });
        }
    }

    const visibleTaskGroups = isValid
        ? taskGroups.filter((taskGroup) => taskGroup.parent_id === currentTaskGroupId)
        : [];
    const visibleTasks = isValid
        ? tasks.filter(
              (task) =>
                  task.group_parent_id === currentTaskGroupId &&
                  task.task_parent_id === null,
          )
        : [];

    const subTasksByParent: Record<string, Task[]> = {};

    for (const task of tasks) {
        if (!task.task_parent_id) {
            continue;
        }

        subTasksByParent[task.task_parent_id] ??= [];
        subTasksByParent[task.task_parent_id].push(task);
    }

    return (
        <>
            <section className="glass-panel dashboard-hero">
                <div>
                    <div className="section-label">Dashboard</div>
                    <h1>{currentTaskGroup?.title ?? "Root workspace"}</h1>
                    <p className="dashboard-hero__copy">
                        {currentTaskGroup?.description ||
                            "Move through task groups from the root path and keep the visible tasks scoped to the current workspace."}
                    </p>
                </div>

                <div className="dashboard-hero__meta">
                    <div className="dashboard-stat">
                        <FolderRoundedIcon fontSize="small" />
                        <span>{visibleTaskGroups.length} groups</span>
                    </div>
                    <div className="dashboard-stat">
                        <TaskRoundedIcon fontSize="small" />
                        <span>{visibleTasks.length} tasks</span>
                    </div>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={openCreateTaskGroupModal}
                    >
                        <AddRoundedIcon fontSize="small" />
                        New group
                    </button>
                    <button
                        type="button"
                        className="primary-button"
                        onClick={openCreateTaskModal}
                    >
                        <AddRoundedIcon fontSize="small" />
                        New task
                    </button>
                    {currentTaskGroup ? (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                                openEditTaskGroupModal(currentTaskGroup);
                            }}
                        >
                            <EditRoundedIcon fontSize="small" />
                            Edit group
                        </button>
                    ) : null}
                </div>
            </section>

            <section className="glass-panel dashboard-panel">
                <Breadcrumbs path={path} />
            </section>

            {isLoading ? (
                <section className="glass-panel dashboard-panel dashboard-panel--empty">
                    <p>Loading tasks and task groups...</p>
                </section>
            ) : null}

            {!isLoading && errorMessage ? (
                <section className="glass-panel dashboard-panel dashboard-panel--empty">
                    <p>{errorMessage}</p>
                </section>
            ) : null}

            {!isLoading && !errorMessage && !isValid ? (
                <section className="glass-panel dashboard-panel dashboard-panel--empty">
                    <h2>Unknown task-group path</h2>
                    <p>
                        The current `/dashboard/*` path does not match the parent-child
                        structure of your task groups.
                    </p>
                    <Link to="/dashboard" className="secondary-button secondary-button--link">
                        Return to root
                    </Link>
                </section>
            ) : null}

            {!isLoading && !errorMessage && isValid ? (
                <div className="dashboard-grid">
                    <section className="glass-panel dashboard-panel">
                        <div className="dashboard-panel__header">
                            <div>
                                <div className="section-label">Task groups</div>
                                <h2>Nested spaces</h2>
                            </div>
                            <div className="dashboard-panel__actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={openCreateTaskGroupModal}
                                >
                                    <AddRoundedIcon fontSize="small" />
                                    Add group
                                </button>
                            </div>
                        </div>

                        {visibleTaskGroups.length > 0 ? (
                            <div className="card-grid">
                                {visibleTaskGroups.map((taskGroup) => {
                                    const href = `/dashboard/${[...pathIds, taskGroup.id].join("/")}`;
                                    const childGroupCount = taskGroups.filter(
                                        (candidate) => candidate.parent_id === taskGroup.id,
                                    ).length;
                                    const taskCount = tasks.filter(
                                        (task) =>
                                            task.group_parent_id === taskGroup.id &&
                                            task.task_parent_id === null,
                                    ).length;

                                    return (
                                        <TaskGroupCard
                                            key={taskGroup.id}
                                            taskGroup={taskGroup}
                                            href={href}
                                            childGroupCount={childGroupCount}
                                            taskCount={taskCount}
                                            onEdit={openEditTaskGroupModal}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                No child task groups in this location.
                            </div>
                        )}
                    </section>

                    <section className="glass-panel dashboard-panel">
                        <div className="dashboard-panel__header">
                            <div>
                                <div className="section-label">Tasks</div>
                                <h2>Direct work items</h2>
                            </div>
                            <div className="dashboard-panel__actions">
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={openCreateTaskModal}
                                >
                                    <AddRoundedIcon fontSize="small" />
                                    Add task
                                </button>
                            </div>
                        </div>

                        {visibleTasks.length > 0 ? (
                            <div className="card-grid">
                                {visibleTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        subTasks={subTasksByParent[task.id] ?? []}
                                        onEdit={openEditTaskModal}
                                        onAddSubTask={openCreateSubTaskModal}
                                        onToggleAchieved={handleToggleTaskAchieved}
                                        onToggleSubTaskAchieved={handleToggleTaskAchieved}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                No tasks in this task group yet.
                            </div>
                        )}
                    </section>
                </div>
            ) : null}

            <TaskEditModal
                open={isTaskModalOpen}
                task={selectedTask}
                parentGroupId={currentTaskGroupId}
                parentTask={subTaskParent}
                onClose={closeTaskModal}
                onSaved={(savedTask) => {
                    setTasks((currentTasks) => {
                        const alreadyExists = currentTasks.some(
                            (task) => task.id === savedTask.id,
                        );

                        if (alreadyExists) {
                            return currentTasks.map((task) =>
                                task.id === savedTask.id ? savedTask : task,
                            );
                        }

                        return [...currentTasks, savedTask];
                    });
                }}
                onDeleted={handleDeletedTask}
            />

            <TaskGroupEditModal
                open={isTaskGroupModalOpen}
                taskGroup={selectedTaskGroup}
                parentGroupId={currentTaskGroupId}
                onClose={closeTaskGroupModal}
                onSaved={(savedTaskGroup) => {
                    setTaskGroups((currentTaskGroups) =>
                        currentTaskGroups.some(
                            (taskGroup) => taskGroup.id === savedTaskGroup.id,
                        )
                            ? currentTaskGroups.map((taskGroup) =>
                                  taskGroup.id === savedTaskGroup.id
                                      ? savedTaskGroup
                                      : taskGroup,
                              )
                            : [...currentTaskGroups, savedTaskGroup],
                    );
                }}
                onDeleted={handleDeletedTaskGroup}
            />
        </>
    );
}
