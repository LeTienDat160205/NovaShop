import styled from "styled-components";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

export const WrapperTypeProduct = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    justify-content: flex-start;
    border-bottom: 1px solid red;
    height: 44px;
`

export const WrapperButtonMore = styled(ButtonComponent)`
    &:hover {
        color: #fff !important;
        background: rgb(13, 92, 182) !important;
        span {
            color: #fff !important;
        }
    }
    width: 100%;
    text-align: center;
`

// export const WrapperProducts = styled.div`
//     display: flex;
//     justify-content: flex-start;
//     gap: 30px;
//     margin-top: 20px;
//     flex-wrap: wrap;
// `
export const WrapperProducts = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 200px);
  justify-content: space-between;
  gap: 30px 0;
  margin-top: 20px;
`;
