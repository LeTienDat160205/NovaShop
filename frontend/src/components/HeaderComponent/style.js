import styled from "styled-components";
import { Row } from "antd";

export const WrapperHeader = styled(Row)`
  padding: 10px 120px;
  background-color: rgb(26, 148, 255);
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;

  @media (max-width: 900px) {
    padding: 10px 24px;
  }
`;

export const WrapperTextHeader = styled.span`
  font-size: 22px;
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
`;

export const WrapperHeaderAccount = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  gap: 10px;
  cursor: pointer;
`;

export const WrapperTextHeaderSmall = styled.span`
  display: block;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
`;
