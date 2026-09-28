import { Steps } from "antd";
import styled from "styled-components";

const { Step } = Steps;

export const StepContainer = styled.div`
  margin: 24px 0;

  .ant-steps-item-process
    > .ant-steps-item-container
    > .ant-steps-item-icon {
    background: #9255fd;
    border-color: #9255fd;
  }

  .ant-steps-item-process .ant-steps-item-title {
    color: #9255fd;
  }
`;

export const CustomStep = styled(Step)`
  .ant-steps-item-process
    > .ant-steps-item-container
    > .ant-steps-item-icon {
    background: #9255fd;
  }
`;