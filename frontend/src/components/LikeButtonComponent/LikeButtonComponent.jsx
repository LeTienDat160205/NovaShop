import React from "react";

const LikeButtonComponent = ({ dataHref }) => (
  <div style={{ marginTop: "8px" }}>
    <div className="fb-like" data-href={dataHref} data-width="" data-layout="" data-action="" data-size="" data-share="true" />
  </div>
);

export default LikeButtonComponent;
