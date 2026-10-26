import React from "react";
import {
  WrapperLabelStyle,
  WrapperContent,
  WrapperTextPrice,
} from "./style";
import { Checkbox, Rate, Input, Button } from "antd";

const NavbarComponent = ({
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  brands = [],
}) => {

  const priceOptions = [
    { label: "Dưới 100.000 đ", min: 0, max: 100000 },
    { label: "100.000 đ - 500.000 đ", min: 100000, max: 500000 },
    { label: "500.000 đ - 2.000.000 đ", min: 500000, max: 2000000 },
    { label: "Trên 2.000.000 đ", min: 2000000, max: null },
  ];

  const renderContent = (type, options) => {
    switch (type) {

      case "search":
        return (
          <Input.Search
            placeholder="Tìm theo tên..."
            allowClear
            value={filters.name || ""}
            onChange={(e) => onFilterChange("name", e.target.value)}
            style={{ width: "100%" }}
          />
        );


      case "checkbox":
        if (!options || options.length === 0) {
          return <span style={{ color: "#888", fontSize: "13px" }}>Không có hãng nào</span>;
        }

        return (
          <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
            <Checkbox.Group
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
              value={filters.brand ? [filters.brand] : []}
              onChange={(checkedValues) => {

                const selected = checkedValues[checkedValues.length - 1] || "";
                onFilterChange("brand", selected);
              }}
            >
              {options.map((option) => (
                <Checkbox
                  key={option.value}
                  style={{ marginLeft: 0 }}
                  value={option.value}
                >
                  {option.label}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </div>
        );


      case "star":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {options.map((star) => {
              const isSelected = Number(filters.rating) === star;
              return (
                <div
                  key={star}
                  onClick={() => onFilterChange("rating", isSelected ? "" : star)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    background: isSelected ? "#e6f7ff" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <Rate
                    style={{ fontSize: "12px", color: "orange" }}
                    disabled
                    value={star}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: isSelected ? "#1890ff" : "inherit",
                      fontWeight: isSelected ? 500 : "normal",
                    }}
                  >
                    {`từ ${star} sao`}
                  </span>
                </div>
              );
            })}
          </div>
        );


      case "price":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {options.map((item, index) => {
              const isSelected =
                filters.minPrice === item.min && filters.maxPrice === item.max;
              return (
                <WrapperTextPrice
                  key={index}
                  onClick={() => {
                    if (isSelected) {
                      onFilterChange("minPrice", null);
                      onFilterChange("maxPrice", null);
                    } else {
                      onFilterChange("minPrice", item.min);
                      onFilterChange("maxPrice", item.max);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: isSelected ? "#e6f7ff" : "#f5f5f5",
                    color: isSelected ? "#1890ff" : "#333",
                    border: isSelected ? "1px solid #91d5ff" : "1px solid #eee",
                    display: "inline-block",
                  }}
                >
                  {item.label}
                </WrapperTextPrice>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ background: "#fff", padding: "12px", borderRadius: "6px" }}>

      <WrapperLabelStyle>Tên sản phẩm</WrapperLabelStyle>
      <WrapperContent>{renderContent("search")}</WrapperContent>


      <WrapperLabelStyle style={{ marginTop: "16px" }}>
        Thương hiệu
      </WrapperLabelStyle>
      <WrapperContent>
        {renderContent(
          "checkbox",
          brands.map((b) => ({ label: b, value: b }))
        )}
      </WrapperContent>


      <WrapperLabelStyle style={{ marginTop: "16px" }}>
        Đánh giá
      </WrapperLabelStyle>
      <WrapperContent>{renderContent("star", [5, 4, 3])}</WrapperContent>


      <WrapperLabelStyle style={{ marginTop: "16px" }}>
        Khoảng giá
      </WrapperLabelStyle>
      <WrapperContent>{renderContent("price", priceOptions)}</WrapperContent>


      <Button
        type="dashed"
        danger
        block
        onClick={onResetFilters}
        style={{ marginTop: "16px" }}
      >
        Xóa tất cả bộ lọc
      </Button>
    </div>
  );
};

export default NavbarComponent;