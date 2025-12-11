import { useState } from "react";
import { Card, DatePicker, Select, Button, Row, Col, Typography } from "antd";
import { Line } from "@ant-design/plots";
import { Bar } from "@ant-design/plots";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const Analytics = () => {
  const [filters, setFilters] = useState({
    dateRange: null,
    productId: null,
  });
  const revenueData = [
    { date: "2025-01-01", revenue: 1200000 },
    { date: "2025-01-02", revenue: 2400000 },
    { date: "2025-01-03", revenue: 1900000 },
    { date: "2025-01-04", revenue: 3000000 },
  ];

  const productRevenueData = [
    { product: "Đắc Nhân Tâm", revenue: 9000000 },
    { product: "Nhà Giả Kim", revenue: 6500000 },
    { product: "7 Thói Quen", revenue: 3500000 },
  ];

  const lineConfig = {
    data: revenueData,
    xField: "date",
    yField: "revenue",
    smooth: true,
    height: 300,
  };

  const barConfig = {
    data: productRevenueData,
    xField: "revenue",
    yField: "product",
    seriesField: "product",
    height: 300,
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Thống kê doanh thu</Title>
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <label style={{ fontWeight: 500 }}>Lọc theo ngày</label>
            <RangePicker
              style={{ width: "100%", marginTop: 5 }}
              onChange={(value) => setFilters({ ...filters, dateRange: value })}
            />
          </Col>

          <Col span={8}>
            <label style={{ fontWeight: 500 }}>Sản phẩm</label>
            <Select
              style={{ width: "100%", marginTop: 5 }}
              placeholder="Chọn sản phẩm"
              onChange={(value) => setFilters({ ...filters, productId: value })}
              options={[
                { label: "Đắc Nhân Tâm", value: 1 },
                { label: "Nhà Giả Kim", value: 2 },
                { label: "7 Thói Quen", value: 3 },
              ]}
            />
          </Col>

          <Col span={8} style={{ display: "flex", alignItems: "flex-end" }}>
            <Button type="primary" style={{ width: "100%" }}>
              Lọc dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Title level={5}>Tổng doanh thu</Title>
            <Title level={3} style={{ color: "#1677ff" }}>
              25.500.000₫
            </Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={5}>Tổng đơn hàng</Title>
            <Title level={3} style={{ color: "#52c41a" }}>
              320 đơn
            </Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={5}>Sản phẩm bán chạy nhất</Title>
            <Title level={4}>Đắc Nhân Tâm</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={5}>Tổng số sách bán ra</Title>
            <Title level={3} style={{ color: "#faad14" }}>
              1.250 cuốn
            </Title>
          </Card>
        </Col>
      </Row>
      <Card style={{ marginBottom: 20 }}>
        <Title level={5}>Doanh thu theo ngày</Title>
        <Line {...lineConfig} />
      </Card>
      <Card>
        <Title level={5}>Doanh thu theo từng sản phẩm</Title>
        <Bar {...barConfig} />
      </Card>
    </div>
  );
};

export default Analytics;
