import { Steps } from "antd";

const StepComponent = ({ current = 0, items = [] }) => (
  <Steps current={current} items={items} />
);

export default StepComponent;
