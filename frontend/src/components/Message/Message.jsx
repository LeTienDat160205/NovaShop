import { message } from "antd";

export const success = (mes = "Success") => message.success(mes);
export const error = (mes = "Error") => message.error(mes);
export const warning = (mes = "Warning") => message.warning(mes);
