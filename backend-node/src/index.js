const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { default: mongoose } = require("mongoose");
const productRoutes = require('./routes/ProductRouter');
const authRoutes = require('./routes/AuthRouter');
const cartRoutes = require('./routes/CartRouter');
const adminProductRoutes = require('./routes/AdminProductRouter');

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 3001;

const adminUserRoutes = require('./routes/AdminUserRouter');

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    `mongodb+srv://novashopdb:${process.env.MONGO_DB}@novashopdb.1rntkxm.mongodb.net/novashopdb?appName=NovaShopDB`,
  )
  .then(() => {
    console.log("Kết nối DB thành công");
  })
  .catch((err) => {
    console.log(err);
  });

app.use('/api/product', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin/products', adminProductRoutes);

app.use('/api/admin/users', adminUserRoutes);

app.listen(port, () => {
  console.log("Server đang chạy tại cổng: " + port);
});
