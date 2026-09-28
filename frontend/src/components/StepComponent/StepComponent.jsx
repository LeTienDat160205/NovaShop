import { Steps } from "antd";
import React from "react";

const StepComponent = ({ current = 0, items = [] }) => (
  <Steps
    current={current}
    items={items.map((item) => ({
      ...item,
      className: "novashop-current-step",
    }))}
  />
);

export default StepComponent;