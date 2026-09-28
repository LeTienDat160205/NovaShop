import { Drawer } from "antd";
import React from "react";

const DrawerComponent = ({ title = "Drawer", placement = "right", isOpen, open, children, ...rests }) => (
  <Drawer title={title} placement={placement} open={open ?? isOpen ?? false} {...rests}>{children}</Drawer>
);

export default DrawerComponent;
