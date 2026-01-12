import { atom } from "jotai";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

// Atom to store notifications
export const notificationsAtom = atom<Notification[]>([]);

// Atom to get unread notifications count
export const unreadNotificationsCountAtom = atom((get) => {
  const notifications = get(notificationsAtom);
  return notifications.filter((notification) => !notification.read).length;
});

// Atom to mark a notification as read
export const markNotificationAsReadAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const notifications = get(notificationsAtom);
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    set(notificationsAtom, updatedNotifications);
  }
);

// Atom to mark all notifications as read
export const markAllNotificationsAsReadAtom = atom(null, (get, set) => {
  const notifications = get(notificationsAtom);
  const updatedNotifications = notifications.map((notification) => ({
    ...notification,
    read: true,
  }));
  set(notificationsAtom, updatedNotifications);
});

// Atom to clear all notifications
export const clearAllNotificationsAtom = atom(null, (_, set) => {
  set(notificationsAtom, []);
}); 