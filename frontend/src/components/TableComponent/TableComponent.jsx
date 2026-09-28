import { Table } from "antd";
import React, { useState } from "react";
import Loading from "../LoadingComponent/Loading";

const TableComponent = ({ selectionType = "checkbox", data: dataSource = [], isLoading = false, columns = [], handleDelteMany, ...props }) => {
  const [rowSelectedKeys, setRowSelectedKeys] = useState([]);
  return (
    <Loading isLoading={isLoading}>
      {!!rowSelectedKeys.length && handleDelteMany && <div style={{ background: "#1d1ddd", color: "#fff", fontWeight: "bold", padding: "10px", cursor: "pointer" }} onClick={() => handleDelteMany(rowSelectedKeys)}>Xóa tất cả</div>}
      <Table rowSelection={{ type: selectionType, onChange: setRowSelectedKeys }} columns={columns} dataSource={dataSource} {...props} />
    </Loading>
  );
};

export default TableComponent;
