import { useState, useEffect } from "react";
import { Card, DatePicker, Select, Button, Row, Col, Typography, message } from "antd";
import { Line, Bar } from "@ant-design/plots";
import api from "../../config/axios.customize";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const Analytics = () => {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    productId: null,
  });

  const [products, setProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [bestProduct, setBestProduct] = useState("Không có");
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [productRevenue, setProductRevenue] = useState([]);

  /** ============================
   *  Lấy danh sách sản phẩm
   ==============================*/
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?limit=1000");

      const list =
        res.data?.data?.items?.map((p: any) => ({
          label: p.name,
          value: p._id,
        })) || [];

      setProducts(list);
    } catch (err) {
      console.log("Product error:", err);
      message.error("Không tải được danh sách sản phẩm");
    }
  };

  /** ============================
   *  Lấy dữ liệu thống kê
   ==============================*/
  const fetchAnalytics = async () => {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.productId) params.productId = filters.productId;

      /** ---- Tổng doanh thu ---- */
      const revenueRes = await api.get("/analytics/revenue", { params });
      const rev = revenueRes?.data?.data || {};

      setTotalRevenue(rev.totalRevenue || 0);
      setTotalOrders(rev.totalOrders || 0);

      /** ---- Doanh thu theo sản phẩm ---- */
      const productRes = await api.get("/analytics/revenue-by-product", { params });
      const productData = productRes.data?.data || [];

      setProductRevenue(productData);

      if (productData.length > 0) {
        setBestProduct(productData[0].productName || "Không có");
      }

      /** ---- Doanh thu theo ngày ---- */
      const dailyRes = await api.get("/analytics/revenue-daily", { params });
      const dailyData = dailyRes.data?.data || [];

      setDailyRevenue(
        dailyData.map((item: any) => ({
          date: item._id,
          revenue: item.totalRevenue,
        }))
      );
    } catch (err) {
      console.log("Analytics error:", err);
      message.error("Không tải được dữ liệu thống kê");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Thống kê doanh thu</Title>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <label>Lọc theo ngày</label>
            <RangePicker
              style={{ width: "100%", marginTop: 5 }}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  startDate: value ? value[0].startOf("day").toISOString() : null,
                  endDate: value ? value[1].endOf("day").toISOString() : null,
                })
              }
            />
          </Col>

          <Col span={8}>
            <label>Sản phẩm</label>
            <Select
              style={{ width: "100%", marginTop: 5 }}
              placeholder="Chọn sản phẩm"
              allowClear
              options={products}
              onChange={(value) => setFilters({ ...filters, productId: value })}
            />
          </Col>

          <Col span={8} style={{ display: "flex", alignItems: "flex-end" }}>
            <Button type="primary" style={{ width: "100%" }} onClick={fetchAnalytics}>
              Lọc dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Title level={5}>Tổng doanh thu</Title>
            <Title level={3} style={{ color: "#1677ff" }}>
              {totalRevenue.toLocaleString()}₫
            </Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={5}>Tổng đơn hàng</Title>
            <Title level={3} style={{ color: "#52c41a" }}>
              {totalOrders} đơn
            </Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={5}>Sản phẩm bán chạy nhất</Title>
            <Title level={4}>{bestProduct}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={5}>Tổng số sách bán ra</Title>
            <Title level={3} style={{ color: "#faad14" }}>
              {productRevenue.reduce(
                (sum, p: any) => sum + (p.totalQuantitySold || 0),
                0
              )}{" "}
              cuốn
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Chart theo ngày */}
      <Card style={{ marginBottom: 20 }}>
        <Title level={5}>Doanh thu theo ngày</Title>
        <Line data={dailyRevenue} xField="date" yField="revenue" smooth height={300} />
      </Card>

      {/* Chart theo sản phẩm */}
      <Card>
        <Title level={5}>Doanh thu theo từng sản phẩm</Title>
        <Bar data={productRevenue} xField="totalRevenue" yField="productName" height={300} />
      </Card>
    </div>
  );
};

export default Analytics;
