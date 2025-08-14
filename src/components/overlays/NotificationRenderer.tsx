import { Transition } from "@headlessui/react";
import { useNotificationContext } from "../../context/NotificationContext";
import NotificationSimple from "./NotificationSimple";

const NotificationRenderer = () => {
    const { notifications, removeNotification } = useNotificationContext();

    return (
        <div aria-live="assertive" className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 py-6 z-50">
            <div className="flex flex-col w-auto items-center space-y-4">
                {notifications.map((notification) => (
                    <Transition
                        key={notification.id}
                        show={true}
                        as="div"
                        enter="transition-opacity ease-out duration-300"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition-opacity ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                    >
                        <>
                            <NotificationSimple
                                type={notification.type}
                                message={notification.message}
                                description={notification.description}
                                setShow={() => removeNotification(notification.id)}
                            />
                        </>
                    </Transition>
                ))}
            </div>
        </div>
    );
};

export default NotificationRenderer;
