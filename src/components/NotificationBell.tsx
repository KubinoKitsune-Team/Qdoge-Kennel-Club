import { useAtom } from "jotai";
import { Bell } from "lucide-react";
import { useState } from "react";
import {
  notificationsAtom,
  unreadNotificationsCountAtom,
  markNotificationAsReadAtom,
  markAllNotificationsAsReadAtom,
  clearAllNotificationsAtom,
} from "@/store/notifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function NotificationBell() {
  const [notifications] = useAtom(notificationsAtom);
  const [unreadCount] = useAtom(unreadNotificationsCountAtom);
  const [, markAsRead] = useAtom(markNotificationAsReadAtom);
  const [, markAllAsRead] = useAtom(markAllNotificationsAsReadAtom);
  const [, clearAll] = useAtom(clearAllNotificationsAtom);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-lg border-none bg-transparent p-2 hover:text-primary">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="h-7 text-xs"
              >
                Mark all as read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn("cursor-pointer border-b p-4 last:border-b-0", !notification.read && "bg-accent/50")}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 rounded-full p-1",
                          notification.type === "success" && "bg-success/20 text-success",
                          notification.type === "error" && "bg-destructive/20 text-destructive",
                          notification.type === "warning" && "bg-warning/20 text-warning",
                          notification.type === "info" && "bg-info/20 text-info",
                        )}
                      >
                        {notification.type === "success" && "✓"}
                        {notification.type === "error" && "✕"}
                        {notification.type === "warning" && "!"}
                        {notification.type === "info" && "i"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
