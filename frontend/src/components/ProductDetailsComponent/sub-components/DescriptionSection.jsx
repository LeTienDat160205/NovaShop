import React, { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { SectionCard, CardTitle, DescriptionContent, ExpandButtonWrapper, ExpandButton } from '../style';

const DescriptionSection = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  return (
    <SectionCard>
      <CardTitle style={{ fontSize: 16 }}>Mô tả sản phẩm</CardTitle>
      <DescriptionContent $expanded={expanded}>
        {description}
      </DescriptionContent>
      <ExpandButtonWrapper>
        <ExpandButton onClick={() => setExpanded((e) => !e)}>
          {expanded ? (
            <>Thu gọn nội dung <UpOutlined style={{ fontSize: 11 }} /></>
          ) : (
            <>Xem thêm nội dung <DownOutlined style={{ fontSize: 11 }} /></>
          )}
        </ExpandButton>
      </ExpandButtonWrapper>
    </SectionCard>
  );
};

export default DescriptionSection;
