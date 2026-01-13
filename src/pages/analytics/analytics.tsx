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
  Modal,
  Table,
  Tag,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  FireOutlined,
  BookOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
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

  // New: order status stats
  const [paidCount, setPaidCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  // Previous period revenue for comparison display
  const [prevRevenue, setPrevRevenue] = useState<number | null>(null);

  // Modal states for order details
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalOrders, setModalOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);

  // Helper function to get current date range
  const getCurrentDateRange = () => {
    const start = filters.startDate ? new Date(filters.startDate) : (() => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const end = filters.endDate ? new Date(filters.endDate) : (() => {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      return d;
    })();

    return { start, end };
  };

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string | Date, start: Date, end: Date) => {
    const t = new Date(dateStr).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };

  // previous-period comparison removed

  // comparison display removed

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
    } catch (error) {
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

      // Fetch orders list to compute "Đã thanh toán" / "Đã hủy" stats
      const ordersRes = await api.get("/orders/admin/list");
      const allOrdersData = Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : [];
      setAllOrders(allOrdersData);

      const { start, end } = getCurrentDateRange();
      
      // Chỉ lọc theo ngày, không lọc theo sản phẩm cho các thẻ thống kê
      let currentOrders: any[];
      if (!filters.startDate && !filters.endDate) {
        currentOrders = allOrdersData;
      } else {
        currentOrders = allOrdersData.filter((o: any) => isDateInRange(o.createdAt, start, end));
      }

      // Tính totalOrders từ currentOrders
      setTotalOrders(currentOrders.length);

      // Consider an order 'paid' for analytics when it has been delivered successfully
      const currentPaid = currentOrders.filter((o: any) => o.status === "Giao hàng thành công").length;
      const currentCancelled = currentOrders.filter((o: any) =>
        (o.status && String(o.status).toLowerCase().includes("hủy")) || o.payment?.status === "Đã hủy"
      ).length;

      setPaidCount(currentPaid);
      setCancelledCount(currentCancelled);

      // Fetch previous-period revenue (same length immediately before current range)
      try {
        const { start, end } = getCurrentDateRange();
        const duration = end.getTime() - start.getTime() + 1;
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(start.getTime() - duration + 1);

        const prevParams: any = {
          startDate: prevStart.toISOString(),
          endDate: prevEnd.toISOString(),
        };

        if (selectedProduct) prevParams.productId = selectedProduct;

        const prevRes = await api.get("/analytics/revenue", { params: prevParams });
        const prevRev = prevRes.data?.data?.totalRevenue ?? null;
        setPrevRevenue(prevRev !== null ? Number(prevRev) : null);
      } catch (err) {
        setPrevRevenue(null);
      }
    } catch {
      message.error("Không tải được dữ liệu thống kê");
    }
  };

  // Handle click on stat cards to show order details
  const handleStatCardClick = (type: 'all' | 'paid' | 'cancelled') => {
    let currentOrders: any[] = [];
    let title = "";

    // Lọc theo ngày (nếu có chọn)
    if (!filters.startDate && !filters.endDate) {
      currentOrders = allOrders;
    } else {
      const { start, end } = getCurrentDateRange();
      currentOrders = allOrders.filter((o: any) => isDateInRange(o.createdAt, start, end));
    }

    // Tạo tiêu đề với khoảng ngày (nếu có)
    const dateRange = (!filters.startDate && !filters.endDate) ? 
      "" : 
      ` (${formatDateVN(getCurrentDateRange().start.toISOString())} - ${formatDateVN(getCurrentDateRange().end.toISOString())})`;

    // Lọc theo trạng thái
    switch (type) {
      case 'all':
        title = `Tất cả đơn hàng${dateRange}`;
        break;
      case 'paid':
        currentOrders = currentOrders.filter((o: any) => o.status === "Giao hàng thành công");
        title = `Đơn hàng đã thanh toán${dateRange}`;
        break;
      case 'cancelled':
        currentOrders = currentOrders.filter((o: any) =>
          (o.status && String(o.status).toLowerCase().includes("hủy")) || o.payment?.status === "Đã hủy"
        );
        title = `Đơn hàng đã hủy${dateRange}`;
        break;
    }

    setModalOrders(currentOrders);
    setModalTitle(title);
    setIsModalVisible(true);
  };

  // Table columns for order modal
  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (text: string) => `#${text?.slice(-8) || 'N/A'}`,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (user: any) => {
        if (!user) return "—";
        // Nếu backend trả về string (chưa populate)
        if (typeof user === "string") {
          return `User #${user.slice(-6)}`;
        }
        // Nếu đã populate
        return user.name || user.email || `User #${user._id?.slice(-6)}` || "—";
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => formatMoney(amount || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Giao hàng thành công') color = 'green';
        else if (status?.toLowerCase().includes('hủy')) color = 'red';
        else if (status === 'Chờ xử lý') color = 'blue';
        else if (status === 'Đang giao hàng') color = 'orange';
        else if (status === 'Đang yêu cầu Trả hàng/Hoàn tiền') color = 'orange';
        else if (status === 'Trả hàng/Hoàn tiền thành công') color = 'green';
        
        return <Tag color={color}>{status || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateVN(date),
    },
  ];

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

  // Render revenue comparison: shows absolute delta + percent + arrow + label like "so với 7 ngày trước"
  const renderRevenueComparison = (current: number, prev: number | null, s: Date, e: Date) => {
    if (prev === null) return null;

    const delta = current - prev;
    const abs = Math.abs(delta);
    const percent = prev === 0 ? null : Math.round((delta / prev) * 100);
    const isUp = delta >= 0;

    const days = Math.round((e.getTime() - s.getTime() + 1) / (1000 * 60 * 60 * 24));
    const periodLabel = days === 1 ? "1 ngày trước" : `${days} ngày trước`;

    return (
      <div style={{ marginTop: 6 }}>
        <Text type="secondary">
          {formatMoney(abs)} {isUp ? <ArrowUpOutlined style={{ color: 'green' }} /> : <ArrowDownOutlined style={{ color: 'red' }} />} {percent !== null ? (percent >= 0 ? `+${percent}%` : `${percent}%`) : "—"} {' '}
          <Text type="secondary">so với {periodLabel}</Text>
        </Text>
      </div>
    );
  };

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
                    ? value[0]!.startOf("day").toISOString()
                    : null,
                  endDate: value
                    ? value[1]!.endOf("day").toISOString()
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
  <Col span={4}>
    <Card style={statCard("#1677ff")}>
      <Row justify="space-between" align="middle">
        <div>
          <Text type="secondary">Tổng doanh thu</Text>
          <Title level={3} style={{ color: "#1677ff", margin: 0 }}>
            {formatMoney(totalRevenue)}
          </Title>
          {(() => {
            const s = filters.startDate ? new Date(filters.startDate) : (() => { const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d; })();
            const e = filters.endDate ? new Date(filters.endDate) : (() => { const d = new Date(); d.setHours(23,59,59,999); return d; })();
            return renderRevenueComparison(totalRevenue, prevRevenue, s, e);
          })()}
        </div>
        <DollarOutlined style={{ fontSize: 32, color: "#1677ff" }} />
      </Row>
    </Card>
  </Col>

  <Col span={4}>
    <Card 
      style={{...statCard("#52c41a"), cursor: 'pointer'}} 
      onClick={() => handleStatCardClick('all')}
      className="clickable-card"
    >
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

  <Col span={4}>
    <Card 
      style={{...statCard("#13c2c2"), cursor: 'pointer'}} 
      onClick={() => handleStatCardClick('paid')}
      className="clickable-card"
    >
      <Row justify="space-between" align="middle">
        <div>
          <Text type="secondary">Đã thanh toán</Text>
          <Title level={3} style={{ color: "#13c2c2", margin: 0 }}>
            {paidCount}
          </Title> 
        </div>
        <DollarOutlined style={{ fontSize: 32, color: "#13c2c2" }} />
      </Row>
    </Card>
  </Col>

  <Col span={4}>
    <Card 
      style={{...statCard("#ff4d4f"), cursor: 'pointer'}} 
      onClick={() => handleStatCardClick('cancelled')}
      className="clickable-card"
    >
      <Row justify="space-between" align="middle">
        <div>
          <Text type="secondary">Đã hủy</Text>
          <Title level={3} style={{ color: "#ff4d4f", margin: 0 }}>
            {cancelledCount}
          </Title> 
        </div>
        <CloseCircleOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
      </Row>
    </Card>
  </Col>

  <Col span={4}>
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

  <Col span={4}>
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

      {/* Order Details Modal */}
      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          dataSource={modalOrders}
          columns={orderColumns}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
        />
      </Modal>

      <style>{`
        .clickable-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .clickable-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Analytics;

