import React from "react";

const CommentComponent = ({ dataHref, width }) => (
  <div style={{ margin: "-10px -12px 0" }}>
    <div className="fb-comments" data-href={dataHref} data-width={width} data-numposts="5" />
  </div>
);

export default CommentComponent;
