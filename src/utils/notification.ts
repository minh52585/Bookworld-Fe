import { notification } from "antd";

type NotificationType = "success" | "error" | "info" | "warning";

export const showNotification = (
  type: NotificationType,
  message: string,
  description?: string
) => {
  notification[type]({
    message,
    description,
    placement: "topRight",
  });
};
