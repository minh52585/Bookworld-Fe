import { useEffect, useState } from "react";
import {
  Button,
  Form,
  InputNumber,
  message,
  Select,
  Card,
  Row,
  Col,
  Spin,
  Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import api from "@/config/axios.customize";

interface IVariantForm {
  productId: string;
  type: string;
  price: number;
  quantity: number;
}

const AddVariant = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🟢 fix AntD message warning
  const [msg, contextHolder] = message.useMessage();

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.data.items || []);
      } catch (err) {
        console.error(" Lỗi khi tải products:", err);
        msg.error("Không tải được danh sách sản phẩm");
      }
    };
    fetchProducts();
  }, []);

  /* ================= SELECT PRODUCT ================= */
  const handleSelectProduct = async (productId: string) => {
    try {
      setLoadingProduct(true);
      const res = await api.get(`/products/${productId}`);
      const product =
        res.data?.data?.product || res.data?.data || res.data;
      console.log("PRODUCT API 👉", product);
      setSelectedProduct(product);
    } catch (err) {
      console.error("❌ Lỗi khi lấy product:", err);
      msg.error("Không lấy được thông tin sản phẩm");
      setSelectedProduct(null);
    } finally {
      setLoadingProduct(false);
    }
  };

  /* ================= SUBMIT ================= */
  const onFinish = async (values: IVariantForm) => {
    try {
      setSubmitting(true);

      // 🔹 Validate frontend (double-check)
      if (!values.productId) return msg.error("Vui lòng chọn sản phẩm");
      if (!values.type) return msg.error("Vui lòng chọn loại sách");
      if (values.price === undefined || values.price < 0)
        return msg.error("Giá phải >= 0");
      if (values.quantity === undefined || values.quantity < 0)
        return msg.error("Số lượng phải >= 0");

      // 🔹 Prepare payload
      const payload = {
        product_id: values.productId,
        type: values.type,
        price: Number(values.price),
        quantity: Number(values.quantity),
        status: "active",
      };

      console.log("🔥 Payload gửi lên backend:", payload);

      // --- CHỈ THÊM ĐOẠN TOKEN Ở ĐÂY ---
      const token = localStorage.getItem("admin_token");

      // 🔹 Gọi API với Headers Authorization
      const res = await api.post("/variants", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // --------------------------------

      console.log("✅ Response từ backend:", res.data);

      msg.success(res.data?.message || "Thêm biến thể thành công");
      navigate("/variants");
    } catch (err: any) {
      console.error("❌ Lỗi khi thêm variant:", err);

      const msgError =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi thêm biến thể";

      msg.error(msgError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder} {/* 🟢 cần để fix warning AntD message */}
      <Row justify="center">
        <Col span={14}>
          <Card title="Thêm biến thể sản phẩm">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* ================= PRODUCT ================= */}
              <Form.Item
                label="Sản phẩm"
                name="productId"
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
              >
                <Select
                  placeholder="Chọn sản phẩm"
                  showSearch
                  optionFilterProp="children"
                  onChange={(value) => handleSelectProduct(value)}
                >
                  {products.map((p) => (
                    <Select.Option key={p._id} value={p._id}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

               {/* ================= PRODUCT INFO ================= */}
             {selectedProduct && (
          <Spin spinning={loadingProduct}>
            <Card
              size="small"
              title="Thông tin sản phẩm"
              style={{ marginBottom: 16 }}
            >
              <p><b>Tên:</b> {selectedProduct.name}</p>
              <p><b>Tác giả:</b> {selectedProduct.author}</p>
              <p><b>Năm XB:</b> {selectedProduct.namxuatban}</p>
              <p><b>NXB:</b> {selectedProduct.nhaxuatban}</p>
              <p><b>Số trang:</b> {selectedProduct.sotrang}</p>
              <p><b>Kích thước:</b> {selectedProduct.size}</p>
              <p><b>Khối lượng:</b> {selectedProduct.weight} g</p>
              <p><b>Mô tả:</b> {selectedProduct.description || "—"}</p>

              {/* Hiển thị ảnh sản phẩm */}
              {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {selectedProduct.images.map((img: string, index: number) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${selectedProduct.name}-${index}`}
                      style={{
                        width: 120,
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 160,
                    backgroundColor: "#eee",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10,
                    border: "1px solid #ccc",
                  }}
                >
                  Không có ảnh
                </div>
              )}
            </Card>
          </Spin>
        )}

              <Form.Item
                label="Loại bìa"
                name="type"
                rules={[{ required: true, message: "Vui lòng nhập tên biến thể" }]}
              >
                 <Input
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="VD: Bản đặc biệt"
                />
              </Form.Item>
             


              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="VD: 150000"
                />
              </Form.Item>

              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="VD: 100"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  block
                >
                  Xác nhận
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AddVariant;