import { useEffect, useMemo, useState } from "react";
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
import {
  DollarOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import api from "../../config/axios.customize";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

//format
const formatMoney = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateVN = (value: string) => {
  const d = new Date(value);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const Analytics = () => {
  const [filters, setFilters] = useState({
    startDate: null as string | null,
    endDate: null as string | null,
    type: "day",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [bestProduct, setBestProduct] = useState("Không có");
  const [rawRevenue, setRawRevenue] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [productRevenue, setProductRevenue] = useState<any[]>([]);

  const groupRevenue = (data: any[], type: string) => {
    const map = new Map<string, number>();

    data.forEach((item) => {
      const date = new Date(item.time);
      let key = "";

      if (type === "day") key = formatDateVN(item.time);

      if (type === "week") {
        const firstDay = new Date(date);
        firstDay.setDate(date.getDate() - date.getDay() + 1);
        key = formatDateVN(firstDay.toISOString());
      }

      if (type === "month") {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      }

      map.set(key, (map.get(key) || 0) + item.revenue);
    });

    return Array.from(map.entries()).map(([time, revenue]) => ({
      time,
      revenue,
    }));
  };
  const fetchProducts = async () => {
    try {
      // Request a large limit so the dropdown contains as many products as possible
      const res = await api.get("/products", { params: { page: 1, limit: 1000 } });

      // Support different API shapes: data.data.items | data.data.results | data.data
      const list = Array.isArray(res.data?.data?.items)
        ? res.data.data.items
        : Array.isArray(res.data?.data?.results)
        ? res.data.data.results
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      // Map products into Select options { label, value } so AntD Select can display them
      const options = list.map((p: any) => ({
        label: p.name || p.title || p.productName || p._id || "",
        value: p._id || p.id || "",
      }));

      setProducts(options);
    } catch {
      message.error("Không tải được danh sách sản phẩm");
    }
  };


  const fetchAnalytics = async () => {
    try {
      const params: any = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      if (selectedProduct) params.productId = selectedProduct;

      const revenueRes = await api.get("/analytics/revenue", { params });
      const rev = revenueRes.data?.data || {};
      setTotalRevenue(rev.totalRevenue || 0);
      setTotalOrders(rev.totalOrders || 0);

      // Fetch product revenue filtered (used for the product revenue chart)
      const productRes = await api.get("/analytics/revenue-by-product", {
        params,
      });
      const productData = productRes.data?.data || [];
      setProductRevenue(productData);

      // Also fetch the overall best product (do not include productId filter)
      const bestParams: any = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      const productResOverall = await api.get("/analytics/revenue-by-product", {
        params: bestParams,
      });
      const overallProductData = productResOverall.data?.data || [];
      setBestProduct(overallProductData[0]?.productName || "Không có");

      const dailyRes = await api.get("/analytics/revenue-daily", { params });
      const dailyData =
        dailyRes.data?.data?.map((item: any) => ({
          time: item._id,
          revenue: item.totalRevenue,
        })) || [];

      setRawRevenue(dailyData);
      setDailyRevenue(groupRevenue(dailyData, filters.type));
    } catch {
      message.error("Không tải được dữ liệu thống kê");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    setDailyRevenue(groupRevenue(rawRevenue, filters.type));
  }, [filters.type, rawRevenue]);

  const timeColumnConfig = useMemo(
    () => ({
      data: dailyRevenue,
      xField: "time",
      yField: "revenue",
      height: 320,
      columnWidthRatio: 0.6,

      xAxis: {
        label: {
          autoRotate: false,
          formatter: formatDateVN,
        },
      },

      yAxis: {
        min: 0,
        label: {
          formatter: (v: any) => formatMoney(Number(v)),
        },
      },

      tooltip: {
        formatter: (v: any) => ({
          name: "Doanh thu",
          value: formatMoney(v.revenue),
        }),
      },

      // No labels on bars by default; enable if desired
      label: false,
    }),
    [dailyRevenue]
  );


const productChartConfig = {
  data: productRevenue,
  xField: "productName",
  yField: "totalRevenue",
  height: 320,
  columnWidthRatio: 0.5,

  label: false, 

  yAxis: {
    label: {
      formatter: (v: any) => formatMoney(Number(v)),
    },
  },

  tooltip: {
    formatter: (datum: any) => ({
      name: "Doanh thu",
      value: formatMoney(datum.totalRevenue),
    }),
  },
};


  const statCard = (color: string) => ({
    borderLeft: `4px solid ${color}`,
    borderRadius: 8,
  });

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>📊 Thống kê doanh thu </Title>

        <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
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
          <Col span={5}>
            <Text type="secondary">Thống kê theo</Text>
            <Select
              value={filters.type}
              style={{ width: "100%", marginTop: 5 }}
              options={[
                { label: "Theo ngày", value: "day" },
                { label: "Theo tuần", value: "week" },
                { label: "Theo tháng", value: "month" },
              ]}
              onChange={(value) =>
                setFilters({ ...filters, type: value })
              }
            />
          </Col>

          <Col span={7}>
            <Text strong>Sản phẩm</Text>
            <Select
              style={{ width: "100%", marginTop: 5 }}
              placeholder="Tất cả sản phẩm"
              allowClear
              showSearch
              optionFilterProp="label"
              // default filterOption is fine but make it explicit
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              options={products}
              value={selectedProduct || undefined}
              notFoundContent="Không có sản phẩm"
              // Set selected product id into state used by fetchAnalytics
              onChange={(value) => setSelectedProduct((value as string) || null)}
            />
          </Col>

          <Col span={4} style={{ display: "flex", alignItems: "flex-end" }}>
            <Button type="primary" block onClick={fetchAnalytics}>
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>
<Row gutter={16} style={{ marginBottom: 20 }}>
  <Col span={6}>
    <Card style={statCard("#1677ff")}>
      <Row justify="space-between" align="middle">
        <div>
          <Text type="secondary">Tổng doanh thu</Text>
          <Title level={3} style={{ color: "#1677ff", margin: 0 }}>
            {formatMoney(totalRevenue)}
          </Title>
        </div>
        <DollarOutlined style={{ fontSize: 32, color: "#1677ff" }} />
      </Row>
    </Card>
  </Col>

        <Col span={6}>
          <Card style={statCard("#52c41a")}>
            <Row justify="space-between" align="middle">
              <div>
                <Text type="secondary">Tổng đơn hàng</Text>
                <Title level={3} style={{ color: "#52c41a", margin: 0 }}>
                  {totalOrders}
                </Title>
              </div>
              <ShoppingCartOutlined style={{ fontSize: 32, color: "#52c41a" }} />
            </Row>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={statCard("#faad14")}>
            <Row justify="space-between" align="middle">
              <div>
                <Text type="secondary">Sản phẩm bán chạy</Text>
                <Title level={4} style={{ margin: 0 }}>
                  {bestProduct}
                </Title>
              </div>
              <FireOutlined style={{ fontSize: 32, color: "#faad14" }} />
            </Row>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={statCard("#722ed1")}>
            <Row justify="space-between" align="middle">
              <div>
                <Text type="secondary">Số sách bán ra</Text>
                <Title level={3} style={{ color: "#722ed1", margin: 0 }}>
                  {productRevenue.reduce(
                    (s, p: any) => s + (p.totalQuantitySold || 0),
                    0
                  )}{" "}
            cuốn
                </Title>
              </div>
              <BookOutlined style={{ fontSize: 32, color: "#722ed1" }} />
            </Row>
          </Card>
        </Col>
      </Row>


      {/* CHARTS */}
      <Card style={{ marginBottom: 20 }}>
        <Title level={5}>📈 Doanh thu theo thời gian</Title>
        <Column {...timeColumnConfig} />
      </Card>

      <Card>
        <Title level={5}>📦 Doanh thu theo sản phẩm</Title>
        <Column {...productChartConfig} />
      </Card>
    </div>
  );
};

export default Analytics;

