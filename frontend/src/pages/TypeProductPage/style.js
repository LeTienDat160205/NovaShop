import styled from "styled-components";
import { Col } from "antd";








export const WrapperProducts = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const WrapperNavbar = styled(Col)`
    background: #fff;
    margin-right: 10px;
    padding: 10px;
    border-radius: 4px;
    height: fit-content;
    margin-top: 20px;
`