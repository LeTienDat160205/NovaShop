const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const productRoutes = require('./routes/ProductRouter');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

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

app.listen(port, () => {
  console.log("Server đang chạy tại cổng: " + port);
});
