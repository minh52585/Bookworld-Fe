import { useState, useEffect } from "react";
import {
  Card,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Typography,
  message,
} from "antd";
import { Column } from "@ant-design/plots";
import api from "../../config/axios.customize";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const Analytics = () => {
  const [filters, setFilters] = useState<any>({
    startDate: null,
    endDate: null,
    productId: null,
  });

  const [products, setProducts] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [bestProduct, setBestProduct] = useState("Không có");
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [productRevenue, setProductRevenue] = useState<any[]>([]);

  /* ================= LOAD PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?limit=1000");
      const list =
        res.data?.data?.items?.map((p: any) => ({
          label: p.name,
          value: p._id,
        })) || [];
      setProducts(list);
    } catch {
      message.error("Không tải được danh sách sản phẩm");
    }
  };

  /* ================= LOAD ANALYTICS ================= */
  const fetchAnalytics = async () => {
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.productId) params.productId = filters.productId;

      const revenueRes = await api.get("/analytics/revenue", { params });
      const rev = revenueRes?.data?.data || {};
      setTotalRevenue(rev.totalRevenue || 0);
      setTotalOrders(rev.totalOrders || 0);

      const productRes = await api.get(
        "/analytics/revenue-by-product",
        { params }
      );
      const productData = productRes.data?.data || [];
      setProductRevenue(productData);

      if (productData.length > 0) {
        setBestProduct(productData[0].productName || "Không có");
      }

      const dailyRes = await api.get("/analytics/revenue-daily", { params });
      const dailyData = dailyRes.data?.data || [];

      setDailyRevenue(
        dailyData.map((item: any) => ({
          date: item._id,
          revenue: item.totalRevenue,
        }))
      );
    } catch {
      message.error("Không tải được dữ liệu thống kê");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAnalytics();
  }, []);

  /* ================= CHART CONFIG ================= */

  // ✅ DOANH THU THEO NGÀY – CỘT DỌC
  const dailyChartConfig = {
    data: dailyRevenue,
    xField: "date",
    yField: "revenue",
    height: 300,
    columnWidthRatio: 0.5,
    color: "#1677ff",
    label: {
      position: "top",
      formatter: (v: any) => `${v.revenue.toLocaleString()}₫`,
    },
    yAxis: {
      label: {
        formatter: (v: any) => `${Number(v) / 1000}k`,
      },
    },
    tooltip: {
      formatter: (v: any) => ({
        name: "Doanh thu",
        value: `${v.revenue.toLocaleString()}₫`,
      }),
    },
  };

  // ✅ DOANH THU THEO SẢN PHẨM – CỘT DỌC
  const productChartConfig = {
    data: productRevenue,
    xField: "productName",
    yField: "totalRevenue",
    height: 320,
    columnWidthRatio: 0.45,
    color: "#52c41a",
    label: {
      position: "top",
      formatter: (v: any) => `${v.totalRevenue.toLocaleString()}₫`,
    },
    yAxis: {
      label: {
        formatter: (v: any) => `${Number(v) / 1000}k`,
      },
    },
    tooltip: {
      formatter: (v: any) => ({
        name: "Doanh thu",
        value: `${v.totalRevenue.toLocaleString()}₫`,
      }),
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>📊 Thống kê doanh thu</Title>

      {/* ================= FILTER ================= */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Khoảng ngày</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 5 }}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  startDate: value
                    ? value[0].startOf("day").toISOString()
                    : null,
                  endDate: value
                    ? value[1].endOf("day").toISOString()
                    : null,
                })
              }
            />
          </Col>

          <Col span={8}>
            <Text strong>Sản phẩm</Text>
            <Select
              style={{ width: "100%", marginTop: 5 }}
              placeholder="Tất cả sản phẩm"
              allowClear
              options={products}
              onChange={(value) =>
                setFilters({ ...filters, productId: value })
              }
            />
          </Col>

          <Col span={8} style={{ display: "flex", alignItems: "flex-end" }}>
            <Button type="primary" block onClick={fetchAnalytics}>
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ================= SUMMARY ================= */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Text>Tổng doanh thu</Text>
            <Title level={3} style={{ color: "#1677ff" }}>
              {totalRevenue.toLocaleString()}₫
            </Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Tổng đơn hàng</Text>
            <Title level={3} style={{ color: "#52c41a" }}>
              {totalOrders}
            </Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Sản phẩm bán chạy</Text>
            <Title level={4}>{bestProduct}</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text>Số sách bán ra</Text>
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

      {/* ================= CHARTS ================= */}
      <Card style={{ marginBottom: 20 }}>
        <Title level={5}>📅 Doanh thu theo ngày</Title>
        <Column {...dailyChartConfig} />
      </Card>

      <Card>
        <Title level={5}>📦 Doanh thu theo sản phẩm</Title>
        <Column {...productChartConfig} />
      </Card>
    </div>
  );
};

export default Analytics;
