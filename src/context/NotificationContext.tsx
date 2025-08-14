import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    ReactNode,
} from "react";

export interface NotificationItem {
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    description?: ReactNode;
    duration?: number; // in milliseconds
}

interface NotificationContextProps {
    notifications: NotificationItem[];
    showNotification: (notification: Omit<NotificationItem, "id">) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const showNotification = useCallback(
        (notification: Omit<NotificationItem, "id">) => {
            const id = crypto.randomUUID();
            const newNotification = { ...notification, id };
            setNotifications((prev) => [...prev, newNotification]);

            // Auto-remove after duration
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, notification.duration || 4000);
        },
        []
    );

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const value = useMemo(
        () => ({ notifications, showNotification, removeNotification }),
        [notifications, showNotification, removeNotification]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotificationContext must be used within a NotificationProvider");
    return context;
};
