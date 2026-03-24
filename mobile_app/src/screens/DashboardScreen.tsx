import { MaterialIcons } from "@expo/vector-icons";
import { type Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getTasks, updateTaskAchieved } from "../api/Task";
import { getTaskGroups } from "../api/TaskGroup";
import { signOutFromGoogle } from "../api/Auth";
import Breadcrumbs from "../components/Breadcrumbs";
import ScreenCanvas from "../components/ScreenCanvas";
import TaskCard from "../components/Task";
import TaskEditModal from "../components/TaskEditModal";
import TaskGroupCard from "../components/TaskGroup";
import TaskGroupEditModal from "../components/TaskGroupEditModal";
import type { Task } from "../models/taskModel";
import type { TaskGroup } from "../models/taskGroupModel";
import { useSession } from "../providers/sessionContext";
import supabase from "../utils/supabase";
import {
    defaultGroupColor,
    hexToRgba,
    palette,
} from "../utils/theme";

function buildPath(taskGroups: TaskGroup[], pathIds: string[]) {
    const taskGroupsMap = new Map(
        taskGroups.map((taskGroup) => [taskGroup.id, taskGroup]),
    );
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

function collectTaskDescendantIds(tasks: Task[], rootTaskId: string) {
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
) {
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

function getProfileName(session: Session | null) {
    if (!session) {
        return "ToDo User";
    }

    return (
        session.user.user_metadata.full_name ??
        session.user.user_metadata.name ??
        session.user.email ??
        "ToDo User"
    );
}

export default function DashboardScreen() {
    const { session } = useSession();
    const [pathIds, setPathIds] = useState<string[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSigningOut, setIsSigningOut] = useState(false);
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

    const { isValid, path } = useMemo(
        () => buildPath(taskGroups, pathIds),
        [pathIds, taskGroups],
    );

    const currentTaskGroup = path[path.length - 1] ?? null;
    const currentTaskGroupId = currentTaskGroup?.id ?? null;
    const profileName = getProfileName(session);
    const avatarUrl =
        typeof session?.user.user_metadata.avatar_url === "string"
            ? session.user.user_metadata.avatar_url
            : undefined;

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

    function openCreateTaskGroupModal() {
        setSelectedTaskGroup(null);
        setIsTaskGroupModalOpen(true);
    }

    function openEditTaskGroupModal(taskGroup: TaskGroup) {
        setSelectedTaskGroup(taskGroup);
        setIsTaskGroupModalOpen(true);
    }

    async function handleSignOut() {
        setIsSigningOut(true);

        try {
            await signOutFromGoogle().catch(() => null);
            await supabase.auth.signOut();
        } finally {
            setIsSigningOut(false);
        }
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

    function handleSavedTask(savedTask: Task) {
        setTasks((currentTasks) => {
            const exists = currentTasks.some((candidate) => candidate.id === savedTask.id);

            if (exists) {
                return currentTasks.map((candidate) =>
                    candidate.id === savedTask.id ? savedTask : candidate,
                );
            }

            return [...currentTasks, savedTask];
        });
        setErrorMessage(null);
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

    function handleSavedTaskGroup(savedTaskGroup: TaskGroup) {
        setTaskGroups((currentTaskGroups) => {
            const exists = currentTaskGroups.some(
                (candidate) => candidate.id === savedTaskGroup.id,
            );

            if (exists) {
                return currentTaskGroups.map((candidate) =>
                    candidate.id === savedTaskGroup.id ? savedTaskGroup : candidate,
                );
            }

            return [...currentTaskGroups, savedTaskGroup];
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

        if (currentTaskGroup?.id === deletedTaskGroup.id) {
            setPathIds((current) => current.slice(0, -1));
        }

        setErrorMessage(null);
    }

    return (
        <ScreenCanvas>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.brand}>
                        <View style={styles.brandBadge}>
                            <Text style={styles.brandBadgeText}>TD</Text>
                        </View>
                        <View style={styles.brandCopy}>
                            <Text style={styles.brandTitle}>ToDoApp</Text>
                            <Text style={styles.brandSubtitle}>Focused task spaces</Text>
                        </View>
                    </View>

                    <View style={styles.sessionRow}>
                        <View style={styles.profile}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Text style={styles.avatarFallbackText}>
                                        {profileName.slice(0, 1).toUpperCase()}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.profileCopy}>
                                <Text style={styles.profileName}>{profileName}</Text>
                                <Text numberOfLines={1} style={styles.profileEmail}>
                                    {session?.user.email}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => {
                                void handleSignOut();
                            }}
                            disabled={isSigningOut}
                            style={styles.secondaryButton}
                        >
                            {isSigningOut ? (
                                <ActivityIndicator color={palette.textMain} />
                            ) : (
                                <Text style={styles.secondaryButtonText}>Sign out</Text>
                            )}
                        </Pressable>
                    </View>
                </View>

                <View style={styles.hero}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.sectionLabel}>Dashboard</Text>
                        <Text style={styles.heroTitle}>
                            {currentTaskGroup?.title ?? "Root workspace"}
                        </Text>
                        <Text style={styles.heroDescription}>
                            {currentTaskGroup?.description ||
                                "Move through task groups from the root path and keep the visible tasks scoped to the current workspace."}
                        </Text>
                    </View>

                    <View style={styles.heroMeta}>
                        <View style={styles.stat}>
                            <MaterialIcons
                                name="folder"
                                size={16}
                                color={palette.textMuted}
                            />
                            <Text style={styles.statText}>
                                {visibleTaskGroups.length} groups
                            </Text>
                        </View>

                        <View style={styles.stat}>
                            <MaterialIcons
                                name="task-alt"
                                size={16}
                                color={palette.textMuted}
                            />
                            <Text style={styles.statText}>{visibleTasks.length} tasks</Text>
                        </View>

                        <Pressable
                            onPress={openCreateTaskGroupModal}
                            style={styles.secondaryButton}
                        >
                            <MaterialIcons
                                name="add"
                                size={18}
                                color={palette.textMain}
                            />
                            <Text style={styles.secondaryButtonText}>New group</Text>
                        </Pressable>

                        <Pressable onPress={openCreateTaskModal} style={styles.primaryButton}>
                            <MaterialIcons name="add" size={18} color="#ffffff" />
                            <Text style={styles.primaryButtonText}>New task</Text>
                        </Pressable>

                        {currentTaskGroup ? (
                            <Pressable
                                onPress={() => {
                                    openEditTaskGroupModal(currentTaskGroup);
                                }}
                                style={styles.secondaryButton}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={18}
                                    color={palette.textMain}
                                />
                                <Text style={styles.secondaryButtonText}>Edit group</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                <View style={styles.panel}>
                    <Breadcrumbs
                        path={path}
                        onNavigateRoot={() => {
                            setPathIds([]);
                        }}
                        onNavigateTo={(index) => {
                            setPathIds(path.slice(0, index + 1).map((group) => group.id));
                        }}
                    />
                </View>

                {isLoading ? (
                    <View style={[styles.panel, styles.emptyPanel]}>
                        <Text style={styles.emptyTitle}>Loading tasks and task groups...</Text>
                    </View>
                ) : null}

                {!isLoading && errorMessage ? (
                    <View style={[styles.panel, styles.emptyPanel]}>
                        <Text style={styles.errorCopy}>{errorMessage}</Text>
                    </View>
                ) : null}

                {!isLoading && !errorMessage && !isValid ? (
                    <View style={[styles.panel, styles.emptyPanel]}>
                        <Text style={styles.emptyTitle}>Unknown task-group path</Text>
                        <Text style={styles.emptyCopy}>
                            The current path does not match the parent-child structure of
                            your task groups.
                        </Text>
                        <Pressable
                            onPress={() => {
                                setPathIds([]);
                            }}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryButtonText}>Return to root</Text>
                        </Pressable>
                    </View>
                ) : null}

                {!isLoading && !errorMessage && isValid ? (
                    <>
                        <View style={styles.panel}>
                            <View style={styles.panelHeader}>
                                <View style={styles.panelHeaderCopy}>
                                    <Text style={styles.sectionLabel}>Task groups</Text>
                                    <Text style={styles.panelTitle}>Nested spaces</Text>
                                </View>

                                <Pressable
                                    onPress={openCreateTaskGroupModal}
                                    style={styles.secondaryButton}
                                >
                                    <MaterialIcons
                                        name="add"
                                        size={18}
                                        color={palette.textMain}
                                    />
                                    <Text style={styles.secondaryButtonText}>Add group</Text>
                                </Pressable>
                            </View>

                            {visibleTaskGroups.length > 0 ? (
                                <View style={styles.cardList}>
                                    {visibleTaskGroups.map((taskGroup) => {
                                        const childGroupCount = taskGroups.filter(
                                            (candidate) =>
                                                candidate.parent_id === taskGroup.id,
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
                                                childGroupCount={childGroupCount}
                                                taskCount={taskCount}
                                                onOpen={(group) => {
                                                    setPathIds([...pathIds, group.id]);
                                                }}
                                                onEdit={openEditTaskGroupModal}
                                            />
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.emptyCopy}>
                                    No child task groups in this location.
                                </Text>
                            )}
                        </View>

                        <View style={styles.panel}>
                            <View style={styles.panelHeader}>
                                <View style={styles.panelHeaderCopy}>
                                    <Text style={styles.sectionLabel}>Tasks</Text>
                                    <Text style={styles.panelTitle}>Focused work</Text>
                                </View>

                                <Pressable
                                    onPress={openCreateTaskModal}
                                    style={styles.primaryButton}
                                >
                                    <MaterialIcons name="add" size={18} color="#ffffff" />
                                    <Text style={styles.primaryButtonText}>Add task</Text>
                                </Pressable>
                            </View>

                            {visibleTasks.length > 0 ? (
                                <View style={styles.cardList}>
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
                                </View>
                            ) : (
                                <Text style={styles.emptyCopy}>
                                    No tasks in this workspace yet.
                                </Text>
                            )}
                        </View>
                    </>
                ) : null}
            </ScrollView>

            <TaskEditModal
                open={isTaskModalOpen}
                task={selectedTask}
                parentGroupId={currentTaskGroupId}
                parentTask={subTaskParent}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setSelectedTask(null);
                    setSubTaskParent(null);
                }}
                onSaved={handleSavedTask}
                onDeleted={handleDeletedTask}
            />

            <TaskGroupEditModal
                open={isTaskGroupModalOpen}
                taskGroup={selectedTaskGroup}
                parentGroupId={currentTaskGroupId}
                onClose={() => {
                    setIsTaskGroupModalOpen(false);
                    setSelectedTaskGroup(null);
                }}
                onSaved={handleSavedTaskGroup}
                onDeleted={handleDeletedTaskGroup}
            />
        </ScreenCanvas>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        gap: 22,
        paddingTop: 18,
        paddingBottom: 36,
    },
    header: {
        gap: 18,
        padding: 18,
        borderRadius: 32,
        backgroundColor: palette.glassStrong,
        borderWidth: 1,
        borderColor: palette.glassBorder,
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    brandBadge: {
        width: 46,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        backgroundColor: palette.accent,
        shadowColor: hexToRgba(palette.accent, 0.28),
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 20,
        elevation: 4,
    },
    brandBadgeText: {
        color: "#ffffff",
        fontWeight: "800",
    },
    brandCopy: {
        gap: 2,
    },
    brandTitle: {
        color: palette.textMain,
        fontSize: 18,
        fontWeight: "800",
    },
    brandSubtitle: {
        color: palette.textSoft,
    },
    sessionRow: {
        gap: 14,
    },
    profile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 15,
    },
    avatarFallback: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.accentSoft,
    },
    avatarFallbackText: {
        color: palette.accentStrong,
        fontWeight: "800",
    },
    profileCopy: {
        flex: 1,
        gap: 2,
    },
    profileName: {
        color: palette.textMain,
        fontWeight: "700",
    },
    profileEmail: {
        color: palette.textMuted,
    },
    hero: {
        gap: 20,
        padding: 24,
        borderRadius: 32,
        backgroundColor: palette.glassStrong,
        borderWidth: 1,
        borderColor: palette.glassBorder,
    },
    heroCopy: {
        gap: 10,
    },
    sectionLabel: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    heroTitle: {
        color: palette.textMain,
        fontSize: 42,
        lineHeight: 42,
        fontWeight: "800",
        letterSpacing: -1.6,
    },
    heroDescription: {
        color: palette.textMuted,
        lineHeight: 25,
    },
    heroMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 15,
        paddingVertical: 11,
        borderRadius: 999,
        backgroundColor: palette.glassLight,
    },
    statText: {
        color: palette.textMuted,
        fontWeight: "700",
    },
    panel: {
        gap: 20,
        padding: 24,
        borderRadius: 32,
        backgroundColor: palette.glassStrong,
        borderWidth: 1,
        borderColor: palette.glassBorder,
    },
    emptyPanel: {
        alignItems: "flex-start",
    },
    panelHeader: {
        gap: 16,
    },
    panelHeaderCopy: {
        gap: 8,
    },
    panelTitle: {
        color: palette.textMain,
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.8,
    },
    cardList: {
        gap: 18,
    },
    emptyTitle: {
        color: palette.textMain,
        fontSize: 22,
        fontWeight: "800",
    },
    emptyCopy: {
        color: palette.textSoft,
        lineHeight: 22,
    },
    errorCopy: {
        color: palette.danger,
        lineHeight: 22,
    },
    secondaryButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.52)",
    },
    secondaryButtonText: {
        color: palette.textMain,
        fontWeight: "700",
    },
    primaryButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: palette.accent,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
});
