import { useNotificationContext } from "../context/NotificationContext";

export const useNotification = () => {
    const context = useNotificationContext();
    return {
        showNotification: context.showNotification,
        removeNotification: context.removeNotification,
        notifications: context.notifications
    };
};