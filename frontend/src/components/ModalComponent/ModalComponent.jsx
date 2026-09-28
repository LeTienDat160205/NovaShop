import { Modal } from "antd";
import React from "react";

const ModalComponent = ({ title = "Modal", isOpen, open, children, ...rests }) => (
  <Modal title={title} open={open ?? isOpen ?? false} {...rests}>{children}</Modal>
);

export default ModalComponent;
