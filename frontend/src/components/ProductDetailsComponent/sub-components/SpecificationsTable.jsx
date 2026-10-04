import React from 'react';
import { SectionCard, CardTitle, SpecTable } from '../style';

const SpecificationsTable = ({ specifications }) => {
  if (!specifications || Object.keys(specifications).length === 0) return null;

  return (
    <SectionCard>
      <CardTitle style={{ fontSize: 16 }}>Thông tin chi tiết</CardTitle>
      <SpecTable>
        <tbody>
          {Object.entries(specifications).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </SpecTable>
    </SectionCard>
  );
};

export default SpecificationsTable;
