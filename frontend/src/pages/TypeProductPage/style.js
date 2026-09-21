import styled from "styled-components";
import { Col } from "antd";

// export const WrapperProducts = styled.div`
//     display: flex;
//     justify-content: center;
//     gap: 30px;
//     margin-top: 20px;
//     flex-wrap: wrap;
// `
export const WrapperProducts = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 200px);
  justify-content: space-between;
  gap: 30px 0;
  margin-top: 20px;
`;

export const WrapperNavbar = styled(Col)`
    background: #fff;
    margin-right: 10px;
    padding: 10px;
    border-radius: 4px;
    height: fit-content;
    margin-top: 20px;
`