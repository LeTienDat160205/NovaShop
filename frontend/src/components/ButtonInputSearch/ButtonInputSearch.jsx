import React from 'react';
import { Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const ButtonInputSearch = (props) => {
  const {
    size,
    placeholder,
    textButton,
    bordered,
    backgroundColorInput = '#fff',
    backgroundColorButton = 'rgb(13, 92, 182)',
    colorButton = '#fff',
    value,
    onChange,
    onSearch,
  } = props;

  return (
    <div style={{ display: 'flex' }}>
      <Input
        size={size}
        placeholder={placeholder}
        bordered={bordered}
        style={{ backgroundColor: backgroundColorInput, borderRadius: '2px 0 0 2px' }}
        value={value}
        onChange={onChange}
        onPressEnter={onSearch}
      />
      <Button
        size={size}
        style={{
          background: backgroundColorButton,
          border: !bordered && 'none',
          borderRadius: '0 2px 2px 0',
        }}
        icon={<SearchOutlined style={{ color: colorButton }} />}
        onClick={onSearch}
      >
        <span style={{ color: colorButton }}>{textButton}</span>
      </Button>
    </div>
  );
};

export default ButtonInputSearch;