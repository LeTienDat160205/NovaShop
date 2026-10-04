import React from 'react';
import { Link } from 'react-router-dom';
import { BreadcrumbWrapper } from '../style';

const MAX_CHARS = 55;

const truncate = (str) =>
  str && str.length > MAX_CHARS ? str.slice(0, MAX_CHARS) + '...' : str;

const Breadcrumb = ({ categoryPath = [], productName = '' }) => {
  const crumbs = ['Trang chủ', ...categoryPath];

  return (
    <BreadcrumbWrapper aria-label="breadcrumb">
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          {idx === 0 ? (
            <Link to="/">{crumb}</Link>
          ) : (
            <Link to="#">{crumb}</Link>
          )}
          <span className="separator">&gt;</span>
        </React.Fragment>
      ))}
      <span className="current" title={productName}>
        {truncate(productName)}
      </span>
    </BreadcrumbWrapper>
  );
};

export default Breadcrumb;
