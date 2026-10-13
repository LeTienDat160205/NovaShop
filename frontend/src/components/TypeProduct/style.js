import styled from "styled-components";

export const WrapperTypeProduct = styled.div`
  padding: 8px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #38383d;
  background-color: #f5f5fa;
  border-radius: 20px;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;

  /* Hiệu ứng khi rê chuột vào */
  &:hover {
    color: rgb(11, 116, 229);
    background-color: #eaf3fe;
    border-color: rgba(11, 116, 229, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(11, 116, 229, 0.12);
  }

  /* Hiệu ứng khi bấm chuột */
  &:active {
    transform: translateY(0);
  }
`;