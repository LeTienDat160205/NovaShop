const mongoose = require('mongoose');
const Product = require('../models/ProductModel');


const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};


const parsePositiveInt = (value, defaultValue) => {
    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
        return defaultValue;
    }
    return num;
};


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





const createAdminProduct = async (req, res) => {
    try {
        const raw = req.body || {};


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


        if (typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price <= 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Giá bán phải là số hợp lệ lớn hơn 0.'
            });
        }
        const price = Number(raw.price);


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
            listPrice = price;
        }


        const brand = typeof raw.brand === 'string' ? raw.brand.trim() : '';


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


        let group = '';
        let categoryPath = [];

        if (Array.isArray(raw.categoryPath) && raw.categoryPath.length > 0) {
            categoryPath = raw.categoryPath.map((s) => String(s).trim()).filter(Boolean);
            group = categoryPath.join('/');
        } else if (typeof raw.group === 'string' && raw.group.trim()) {
            group = raw.group.trim();
            categoryPath = group.split('/').map((s) => s.trim()).filter(Boolean);
        }


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

            updateData.listPrice = existingListPrice;
            updateData.list_price = existingListPrice;
        }


        if (raw.brand !== undefined) {
            updateData.brand = typeof raw.brand === 'string' ? raw.brand.trim() : '';
        }


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


        if (raw.categoryPath !== undefined && Array.isArray(raw.categoryPath)) {
            const cleanPath = raw.categoryPath.map((s) => String(s).trim()).filter(Boolean);
            updateData.categoryPath = cleanPath;
            updateData.group = cleanPath.join('/');
        } else if (raw.group !== undefined && typeof raw.group === 'string') {
            const cleanGroup = raw.group.trim();
            updateData.group = cleanGroup;
            updateData.categoryPath = cleanGroup.split('/').map((s) => s.trim()).filter(Boolean);
        }


        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Dữ liệu gửi lên không chứa bất kỳ trường nào hợp lệ để cập nhật.'
            });
        }


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
