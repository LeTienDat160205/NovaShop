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
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 20px;
  margin-top: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, minmax(180px, 1fr));
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    gap: 12px;
  }
`;
