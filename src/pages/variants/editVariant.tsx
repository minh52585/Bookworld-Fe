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
  Input
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/config/axios.customize";

interface IVariantForm {
  productId: string;
  type: string;
  price: number;
  quantity: number;
}

const EditVariant = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  
  // 🟢 fix AntD message warning
  const [msg, contextHolder] = message.useMessage();

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.data.items || []);
      } catch (err) {
        msg.error("Không tải được danh sách sản phẩm");
      }
    };
    fetchProducts();
  }, []);

  /* ================= LOAD VARIANT ================= */
  useEffect(() => {
    if (!id) return;

    const fetchVariant = async () => {
      try {
        setLoadingPage(true);
        // Thêm Token khi lấy chi tiết biến thể
        const token = localStorage.getItem("admin_token");
        const res = await api.get(`/variants/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const v = res.data.data;
   

       
        // set form
        form.setFieldsValue({
          productId: v.product_id?._id,
          type: v.type,
          price: v.price,
          quantity: v.quantity,
        });

        // load product detail
        handleSelectProduct(v.product_id?._id);
      } catch (err) {
        msg.error("Không tải được thông tin biến thể");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchVariant();
  }, [id]);

  /* ================= SELECT PRODUCT ================= */
  const handleSelectProduct = async (productId: string) => {
    if (!productId) return;
    try {
      setLoadingProduct(true);
      const res = await api.get(`/products/${productId}`);
      const product =
        res.data?.data?.product || res.data?.data || res.data;
      setSelectedProduct(product);
    } catch (err) {
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

      const payload = {
        product_id: values.productId,
        type: values.type,
        price: Number(values.price),
        quantity: Number(values.quantity),
        status: "active",
      };

      // --- THÊM TOKEN KHI CẬP NHẬT ---
      const token = localStorage.getItem("admin_token");
      await api.put(`/variants/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      msg.success("Cập nhật biến thể thành công");
      navigate("/variants");
    } catch (err: any) {
      msg.error(
        err?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật biến thể"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {contextHolder}
      <Spin spinning={loadingPage}>
        <Row justify="center">
          <Col span={14}>
            <Card title="Cập nhật biến thể sản phẩm">
              <Form form={form} layout="vertical" onFinish={onFinish}>
                {/* ================= PRODUCT ================= */}
                <Form.Item
                  label="Sản phẩm"
                  name="productId"
                  rules={[
                    { required: true, message: "Vui lòng chọn sản phẩm" },
                  ]}
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
                    <p><b>SKU:</b> {selectedProduct.sku}</p>
                    <p><b>Mô tả:</b> {selectedProduct.description || "—"}</p>

                    {Array.isArray(selectedProduct.images) &&
                    selectedProduct.images.length > 0 ? (
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

                {/* ================= VARIANT ================= */}
                <Form.Item label="Loại bìa"
                name="type"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên biến thể" },
                  ]}>
                <Input
                  style={{ width: "100%" }} min={0}
                />
              </Form.Item>

                <Form.Item
                  label="Giá"
                  name="price"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>

                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    block
                  >
                    Cập nhật
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Spin>
    </>
  );
};

export default EditVariant;