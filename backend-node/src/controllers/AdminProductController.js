const mongoose = require('mongoose');
const Product = require('../models/ProductModel');

// Hàm escape các ký tự đặc biệt trong biểu thức chính quy (Regex)
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Hàm parse số nguyên dương an toàn, nếu không hợp lệ thì trả về giá trị mặc định
const parsePositiveInt = (value, defaultValue) => {
    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
        return defaultValue;
    }
    return num;
};

// Hàm validate specifications: từ chối khóa bắt đầu bằng "$", chứa "." hoặc "__proto__"; tối đa 100 khóa; giá trị chuỗi tối đa 5000 ký tự
const validateSpecifications = (specs) => {
    if (specs === null || specs === undefined) {
        return { valid: true, data: {} };
    }
    if (typeof specs !== 'object' || Array.isArray(specs)) {
        return {
            valid: false,
            message: 'Thông số kỹ thuật (specifications) phải là một đối tượng khóa - giá trị.'
        };
    }
    const entries = Object.entries(specs);
    if (entries.length > 100) {
        return {
            valid: false,
            message: 'Thông số kỹ thuật chỉ được có tối đa 100 khóa.'
        };
    }
    const cleanSpecs = {};
    for (const [key, val] of entries) {
        const cleanKey = String(key).trim();
        if (!cleanKey) {
            return {
                valid: false,
                message: 'Tên thông số kỹ thuật không được để trống.'
            };
        }
        if (cleanKey === '__proto__' || cleanKey.startsWith('$') || cleanKey.includes('.')) {
            return {
                valid: false,
                message: `Khóa thông số kỹ thuật "${cleanKey}" không hợp lệ (không được là "__proto__", bắt đầu bằng "$" hoặc chứa dấu ".").`
            };
        }
        const valStr = val !== null && val !== undefined ? String(val) : '';
        if (valStr.length > 5000) {
            return {
                valid: false,
                message: `Giá trị của thông số kỹ thuật "${cleanKey}" không được vượt quá 5.000 ký tự.`
            };
        }
        cleanSpecs[cleanKey] = valStr;
    }
    return { valid: true, data: cleanSpecs };
};

/**
 * GET /api/admin/products/categories
 * Lấy danh sách các giá trị group khác nhau, loại bỏ rỗng/null, sắp xếp A-Z
 */
const getAdminCategories = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            {
                $match: {
                    group: { $exists: true, $nin: [null, ''] }
                }
            },
            {
                $group: {
                    _id: '$group'
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const categoryList = categories
            .map((item) => (typeof item._id === 'string' ? item._id.trim() : ''))
            .filter((group) => group.length > 0);

        return res.status(200).json({
            status: 'OK',
            data: categoryList
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Lỗi máy chủ khi lấy danh mục: ' + error.message
        });
    }
};

/**
 * GET /api/admin/products
 * Danh sách sản phẩm phân trang, tìm kiếm theo tên, sắp xếp _id: -1
 */
const getAdminProducts = async (req, res) => {
    try {
        const page = parsePositiveInt(req.query.page, 1);
        const rawLimit = parsePositiveInt(req.query.limit, 10);
        const limit = Math.min(100, rawLimit);
        const search = (req.query.search || '').trim();

        const query = {};
        if (search) {
            query.name = { $regex: new RegExp(escapeRegex(search), 'i') };
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);

        return res.status(200).json({
            status: 'OK',
            data: products,
            total,
            page,
            limit
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Lỗi máy chủ khi lấy danh sách sản phẩm: ' + error.message
        });
    }
};

/**
 * GET /api/admin/products/:id
 * Chi tiết 1 sản phẩm
 */
const getAdminProductDetails = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Mã sản phẩm (ID) không đúng định dạng.'
            });
        }

        const product = await Product.findById(id).lean();
        if (!product) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm.'
            });
        }

        return res.status(200).json({
            status: 'OK',
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Lỗi máy chủ khi lấy chi tiết sản phẩm: ' + error.message
        });
    }
};

/**
 * POST /api/admin/products
 * Tạo sản phẩm mới
 */
const createAdminProduct = async (req, res) => {
    try {
        const raw = req.body || {};

        // 1. Validate 'name' (bắt buộc, 1 - 300 ký tự)
        if (typeof raw.name !== 'string' || !raw.name.trim()) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Tên sản phẩm là bắt buộc và không được để trống.'
            });
        }
        const name = raw.name.trim();
        if (name.length > 300) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Tên sản phẩm không được vượt quá 300 ký tự.'
            });
        }

        // 2. Validate 'price' (bắt buộc, số hữu hạn > 0)
        if (typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price <= 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Giá bán phải là số hợp lệ lớn hơn 0.'
            });
        }
        const price = Number(raw.price);

        // 3. Validate 'listPrice' (nếu có, phải >= price)
        let listPrice = undefined;
        if (raw.listPrice !== undefined && raw.listPrice !== null && raw.listPrice !== '') {
            if (typeof raw.listPrice !== 'number' || !Number.isFinite(raw.listPrice)) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Giá gốc (listPrice) phải là số hợp lệ.'
                });
            }
            if (raw.listPrice < price) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Giá gốc (listPrice) phải lớn hơn hoặc bằng giá bán (price).'
                });
            }
            listPrice = Number(raw.listPrice);
        } else {
            listPrice = price; // Mặc định bằng giá bán nếu không nhập
        }

        // 4. Validate 'brand' (chuỗi nếu có)
        const brand = typeof raw.brand === 'string' ? raw.brand.trim() : '';

        // 5. Validate 'description' (chuỗi <= 20000 ký tự)
        let description = '';
        if (raw.description !== undefined && raw.description !== null) {
            if (typeof raw.description !== 'string') {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Mô tả sản phẩm phải là chuỗi ký tự.'
                });
            }
            if (raw.description.length > 20000) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Mô tả sản phẩm không được vượt quá 20.000 ký tự.'
                });
            }
            description = raw.description;
        }

        // 6. Validate 'images' (mảng chuỗi URL http/https, tối đa 10)
        let images = [];
        if (raw.images !== undefined && raw.images !== null) {
            if (!Array.isArray(raw.images)) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Hình ảnh phải là một mảng danh sách URL.'
                });
            }
            if (raw.images.length > 10) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Mỗi sản phẩm chỉ được có tối đa 10 hình ảnh.'
                });
            }
            for (let i = 0; i < raw.images.length; i++) {
                const img = raw.images[i];
                if (typeof img !== 'string' || !/^(http:\/\/|https:\/\/)/i.test(img.trim())) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: `Hình ảnh thứ ${i + 1} không hợp lệ (phải bắt đầu bằng http:// hoặc https://).`
                    });
                }
            }
            images = raw.images.map((img) => img.trim());
        }

        // 7. Validate 'specifications' (object thông thường, khóa không rỗng, giá trị ép thành chuỗi)
        let specifications = {};
        if (raw.specifications !== undefined && raw.specifications !== null) {
            const specResult = validateSpecifications(raw.specifications);
            if (!specResult.valid) {
                return res.status(400).json({
                    status: 'ERR',
                    message: specResult.message
                });
            }
            specifications = specResult.data;
        }

        // 8. Đồng bộ danh mục: group & categoryPath
        let group = '';
        let categoryPath = [];

        if (Array.isArray(raw.categoryPath) && raw.categoryPath.length > 0) {
            categoryPath = raw.categoryPath.map((s) => String(s).trim()).filter(Boolean);
            group = categoryPath.join('/');
        } else if (typeof raw.group === 'string' && raw.group.trim()) {
            group = raw.group.trim();
            categoryPath = group.split('/').map((s) => s.trim()).filter(Boolean);
        }

        // Dữ liệu sản phẩm mới (chỉ nhận whitelist và tự sinh các trường bắt buộc)
        const productData = {
            name,
            brand,
            price,
            listPrice,
            list_price: listPrice,
            description,
            images,
            specifications,
            group,
            categoryPath,
            item_id: Date.now(),
            rating: 0
        };

        const newProduct = await Product.create(productData);

        return res.status(201).json({
            status: 'OK',
            message: 'Tạo sản phẩm thành công',
            data: newProduct
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Lỗi máy chủ khi tạo sản phẩm: ' + error.message
        });
    }
};

/**
 * PUT /api/admin/products/:id
 * Cập nhật sản phẩm
 */
const updateAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Mã sản phẩm (ID) không đúng định dạng.'
            });
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm.'
            });
        }

        const raw = req.body || {};
        const updateData = {};

        // 1. Kiểm tra 'name' nếu có gửi
        if (raw.name !== undefined) {
            if (typeof raw.name !== 'string' || !raw.name.trim()) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Tên sản phẩm không được để trống.'
                });
            }
            const name = raw.name.trim();
            if (name.length > 300) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Tên sản phẩm không được vượt quá 300 ký tự.'
                });
            }
            updateData.name = name;
        }

        // 2. Kiểm tra 'price' & 'listPrice' theo giá trị hiệu lực (Effective Price / Effective ListPrice)
        let effectivePrice = Number(existingProduct.price);
        if (raw.price !== undefined) {
            if (typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price <= 0) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Giá bán phải là số lớn hơn 0.'
                });
            }
            effectivePrice = Number(raw.price);
            updateData.price = effectivePrice;
        }

        const existingListPrice = existingProduct.listPrice !== undefined && existingProduct.listPrice !== null
            ? Number(existingProduct.listPrice)
            : (existingProduct.list_price !== undefined && existingProduct.list_price !== null ? Number(existingProduct.list_price) : null);

        let effectiveListPrice = null;
        let isListPriceUpdated = false;

        if (raw.listPrice !== undefined) {
            if (raw.listPrice !== null && raw.listPrice !== '') {
                if (typeof raw.listPrice !== 'number' || !Number.isFinite(raw.listPrice)) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Giá gốc (listPrice) phải là số hợp lệ.'
                    });
                }
                effectiveListPrice = Number(raw.listPrice);
            } else {
                effectiveListPrice = null;
            }
            isListPriceUpdated = true;
        } else {
            effectiveListPrice = existingListPrice;
        }

        // Nếu có giá gốc hiệu lực thì bắt buộc phải >= giá bán hiệu lực
        if (effectiveListPrice !== null && effectiveListPrice !== undefined) {
            if (effectiveListPrice < effectivePrice) {
                return res.status(400).json({
                    status: 'ERR',
                    message: 'Giá gốc (listPrice) phải lớn hơn hoặc bằng giá bán (price).'
                });
            }
        }

        if (isListPriceUpdated) {
            updateData.listPrice = effectiveListPrice;
            updateData.list_price = effectiveListPrice;
        } else if (raw.price !== undefined && existingListPrice !== null) {
            // Đồng bộ giữ nguyên list_price cũ khi chỉ đổi price
            updateData.listPrice = existingListPrice;
            updateData.list_price = existingListPrice;
        }

        // 3. Brand
        if (raw.brand !== undefined) {
            updateData.brand = typeof raw.brand === 'string' ? raw.brand.trim() : '';
        }

        // 4. Description
        if (raw.description !== undefined) {
            if (raw.description !== null) {
                if (typeof raw.description !== 'string') {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Mô tả sản phẩm phải là chuỗi ký tự.'
                    });
                }
                if (raw.description.length > 20000) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Mô tả sản phẩm không được vượt quá 20.000 ký tự.'
                    });
                }
                updateData.description = raw.description;
            } else {
                updateData.description = '';
            }
        }

        // 5. Images
        if (raw.images !== undefined) {
            if (raw.images !== null) {
                if (!Array.isArray(raw.images)) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Hình ảnh phải là một mảng danh sách URL.'
                    });
                }
                if (raw.images.length > 10) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: 'Mỗi sản phẩm chỉ được có tối đa 10 hình ảnh.'
                    });
                }
                for (let i = 0; i < raw.images.length; i++) {
                    const img = raw.images[i];
                    if (typeof img !== 'string' || !/^(http:\/\/|https:\/\/)/i.test(img.trim())) {
                        return res.status(400).json({
                            status: 'ERR',
                            message: `Hình ảnh thứ ${i + 1} không hợp lệ (phải bắt đầu bằng http:// hoặc https://).`
                        });
                    }
                }
                updateData.images = raw.images.map((img) => img.trim());
            } else {
                updateData.images = [];
            }
        }

        // 6. Specifications
        if (raw.specifications !== undefined) {
            if (raw.specifications !== null) {
                const specResult = validateSpecifications(raw.specifications);
                if (!specResult.valid) {
                    return res.status(400).json({
                        status: 'ERR',
                        message: specResult.message
                    });
                }
                updateData.specifications = specResult.data;
            } else {
                updateData.specifications = {};
            }
        }

        // 7. Group & CategoryPath
        if (raw.categoryPath !== undefined && Array.isArray(raw.categoryPath)) {
            const cleanPath = raw.categoryPath.map((s) => String(s).trim()).filter(Boolean);
            updateData.categoryPath = cleanPath;
            updateData.group = cleanPath.join('/');
        } else if (raw.group !== undefined && typeof raw.group === 'string') {
            const cleanGroup = raw.group.trim();
            updateData.group = cleanGroup;
            updateData.categoryPath = cleanGroup.split('/').map((s) => s.trim()).filter(Boolean);
        }

        // Kiểm tra nếu body không chứa trường dữ liệu hợp lệ nào
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Dữ liệu gửi lên không chứa bất kỳ trường nào hợp lệ để cập nhật.'
            });
        }

        // Cập nhật bằng $set chỉ những trường trong whitelist được gửi lên
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        return res.status(200).json({
            status: 'OK',
            message: 'Cập nhật sản phẩm thành công',
            data: updatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Lỗi máy chủ khi cập nhật sản phẩm: ' + error.message
        });
    }
};

/**
 * DELETE /api/admin/products/:id
 * Xóa cứng một sản phẩm
 */
const deleteAdminProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Mã sản phẩm (ID) không đúng định dạng.'
            });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm để xóa.'
            });
        }

        return res.status(200).json({
            status: 'OK',
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: 'Lỗi máy chủ khi xóa sản phẩm: ' + error.message
        });
    }
};

module.exports = {
    getAdminCategories,
    getAdminProducts,
    getAdminProductDetails,
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct
};
