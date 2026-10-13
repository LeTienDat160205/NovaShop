import styled from "styled-components";

export const WrapperTypeProduct = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #27272a;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: color 0.2s ease;

  /* Bỏ padding trái cho item đầu tiên để thẳng hàng với lề bên dưới */
  &:first-child {
    padding-left: 0;
  }

  /* Vạch kẻ phân cách dọc giữa các danh mục */
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 14px;
    background-color: #ebebf0;
  }

  &:hover {
    color: #0b74e5;
  }
`;