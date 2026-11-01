import styled from "styled-components";
import { Card } from "antd";

export const WrapperCardStyle = styled(Card)`
    width: 100%;
    .ant-card-cover img{
        height: 220px;
        width: 100%;
        object-fit: cover;
    }
    position: relative;
`

export const StyleNameProduct = styled.div`
    font-size: 12px;
    line-height: 16px;
    color: rgb(56, 56, 61);
    font-weight: bold;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    min-height: 32px;
`

export const WrapperReportText = styled.div`
    min-width: 0;
    font-size: 10px;
    color: rgb(128, 128, 137);
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 6px 0 0;
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;

    .rating {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        flex: 0 0 auto;
    }

    .review-count {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

export const WrapperPriceText = styled.div`
    color: rgb(255, 66, 78);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
`

export const WrapperDiscountText = styled.span`
    color: rgb(255, 66, 78);
    background: #fff0f1;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 11px;
    font-weight: 500;
`
export  const WrapperStyleTextSell = styled.span`
    flex: 0 0 auto;
    font-size: 10px;
    line-height: 16px;
    color: rgb(120, 120, 120);
`
