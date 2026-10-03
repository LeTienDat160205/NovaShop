// import React, { useEffect, useState } from "react";
// import TypeProduct from "../../components/TypeProduct/TypeProduct";
// import { WrapperTypeProduct, WrapperButtonMore, WrapperProducts } from "./style";
// import SliderComponent from "../../components/SliderComponent/SliderComponent";
// import slider1 from "../../assets/images/slider1.webp";
// import slider2 from "../../assets/images/slider2.webp";
// import slider3 from "../../assets/images/slider3.webp";
// import CardComponent from "../../components/CardComponent/CardComponent";
// import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
// import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
// import * as ProductService from "../../services/ProductService";

// const HomePage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const ITEMS_PER_PAGE = 18;
//   const [limit, setLimit] = useState(ITEMS_PER_PAGE);

//   const arr = [
//     "Điện thoại",
//     "Laptop",
//     "Máy tính bảng",
//     "Tai nghe",
//     "Đồng hồ thông minh",
//     "Thiết bị gia dụng",
//     "Thời trang",
//   ];

//   // Hàm gọi API lấy danh sách sản phẩm
//   const fetchAllProducts = async () => {
//     setLoading(true);
//     try {
//       const res = await ProductService.getAllProduct();
//       if (res?.status === "OK") {
//         setProducts(res?.data || []);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải sản phẩm:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   const handleLoadMore = () => {
//     setLimit((prev) => prev + ITEMS_PER_PAGE);
//   };

//   return (
//     <>
//       <div style={{ padding: "0 120px" }}>
//         <WrapperTypeProduct>
//           {arr.map((item) => {
//             return <TypeProduct name={item} key={item} />;
//           })}
//         </WrapperTypeProduct>
//       </div>
//       <div
//         id="container"
//         style={{
//           backgroundColor: "#efefef",
//           padding: "0 120px",
//           minHeight: "1000px",
//           width: "100%",
//           boxSizing: "border-box",
//         }}
//       >
//         <SliderComponent arrImages={[slider1, slider2, slider3]} />
//         {loading ? (
//           <div style={{ textAlign: "center", marginTop: "20px" }}>Đang tải sản phẩm...</div>
//         ) : (
//           <WrapperProducts>
//             {products?.map((product) => (
//               <CardComponent key={product._id} product={product} />
//             ))}
//           </WrapperProducts>
//         )}
//         <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
//           <WrapperButtonMore
//             textButton="Xem thêm"
//             type="default"
//             styleButton={{
//               border: "1px solid rgb(11, 116, 229)",
//               color: "rgb(11, 116, 229)",
//               width: "240px",
//               height: "30px",
//               borderRadius: "4px",
//             }}
//             styleTextButton={{ fontWeight: 500 }}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// export default HomePage;
import React, { useEffect, useState } from "react";
import TypeProduct from "../../components/TypeProduct/TypeProduct";
import { WrapperTypeProduct, WrapperButtonMore, WrapperProducts } from "./style";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import slider1 from "../../assets/images/slider1.webp";
import slider2 from "../../assets/images/slider2.webp";
import slider3 from "../../assets/images/slider3.webp";
import CardComponent from "../../components/CardComponent/CardComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import * as ProductService from "../../services/ProductService";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1 hàng có 6 sản phẩm -> 3 hàng là 18 sản phẩm
  const ITEMS_PER_PAGE = 18;
  const [limit, setLimit] = useState(ITEMS_PER_PAGE);

  const arr = [
    "Điện thoại",
    "Laptop",
    "Máy tính bảng",
    "Tai nghe",
    "Đồng hồ thông minh",
    "Thiết bị gia dụng",
    "Thời trang",
  ];

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getAllProduct();
      if (res?.status === "OK") {
        setProducts(res?.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Hàm xử lý khi bấm nút "Xem thêm"
  const handleLoadMore = () => {
    setLimit((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <>
      <div style={{ padding: "0 120px" }}>
        <WrapperTypeProduct>
          {arr.map((item) => {
            return <TypeProduct name={item} key={item} />;
          })}
        </WrapperTypeProduct>
      </div>
      <div
        id="container"
        style={{
          backgroundColor: "#efefef",
          padding: "0 120px",
          minHeight: "1000px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <SliderComponent arrImages={[slider1, slider2, slider3]} />

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>Đang tải sản phẩm...</div>
        ) : (
          <WrapperProducts>
            {/* Cắt mảng products chỉ lấy số lượng theo limit */}
            {products?.slice(0, limit).map((product) => (
              <CardComponent key={product._id} product={product} />
            ))}
          </WrapperProducts>
        )}

        {/* Nút xem thêm: Chỉ hiện khi số sản phẩm hiện tại ít hơn tổng số sản phẩm trong DB */}
        {products.length > limit && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px', paddingBottom: '20px' }}>
            <WrapperButtonMore
              textButton="Xem thêm"
              type="default"
              onClick={handleLoadMore}
              styleButton={{
                border: "1px solid rgb(11, 116, 229)",
                color: "rgb(11, 116, 229)",
                width: "240px",
                height: "38px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              styleTextButton={{ fontWeight: 500 }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;