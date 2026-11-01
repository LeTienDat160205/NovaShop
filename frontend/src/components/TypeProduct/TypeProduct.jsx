import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  LaptopOutlined,
  SettingOutlined,
  SoundOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { WrapperTypeProduct } from "./style";

const CATEGORY_ICONS = {
  earphone: CustomerServiceOutlined,
  "mouse-keyboard": LaptopOutlined,
  accessories: ThunderboltOutlined,
  smartwatch: ClockCircleOutlined,
  speaker: SoundOutlined,
  "laptop-accessories": SettingOutlined,
};

const TypeProduct = ({ name, slug, onClick }) => {
  const CategoryIcon = CATEGORY_ICONS[slug];

  return (
    <WrapperTypeProduct onClick={onClick} style={{ cursor: "pointer", userSelect: "none" }}>
      {CategoryIcon && <CategoryIcon aria-hidden="true" />}
      {name}
    </WrapperTypeProduct>
  );
};

export default TypeProduct;