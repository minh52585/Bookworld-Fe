import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
  App,
  Avatar,
  Typography,
  Button,
  Drawer,
  Modal,
  Select,
  Space,
  Popconfirm
} from "antd";
import {
  WalletOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { walletAPI } from "@/apis/wallets";
import { transactionAPI } from "@/apis/wallets";
import { Wallet } from "@/types/wallet";
import { WalletTransaction } from "@/types/wallet";

const { Title, Text } = Typography;
const LOCK_REASONS = [
  "Nghi ngờ gian lận",
  "Hoạt động bất thường",
  "Vi phạm điều khoản sử dụng",
  "Yêu cầu từ bộ phận hỗ trợ",
  "Lý do khác",
];

interface Wallet {
  _id: string;
  user: any;
  balance: number;
  status: "active" | "locked";
  lockedAt?: string | null;
  lockReason?: string;
  createdAt: string;
  updatedAt: string;
}
const WalletsPage = () => {
  const { message } = App.useApp();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockReason, setLockReason] = useState<string | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);

  // 🔹 Load wallets
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await walletAPI.getAllWallet();
      if (res.success) {
        setWallets(res.data);
      }
    } catch {
      message.error("Không thể tải danh sách ví");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (walletId: string) => {
    setLoadingTx(true);
    try {
      const res = await transactionAPI.getTransactionsByWalletId(walletId);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch {
      message.error("Không thể tải giao dịch");
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const handleLockWallet = async () => {
  if (!selectedWallet || !lockReason) return;

  try {
    setActionLoading(true);
    await walletAPI.lockWallet(selectedWallet._id, {
      reason: lockReason,
    });

    message.success("Khóa ví thành công");
    setLockModalOpen(false);
    setLockReason("");
    fetchWallets(); // reload danh sách
  } catch (error: any) {
    message.error(error.message || "Khóa ví thất bại");
  } finally {
    setActionLoading(false);
  }
};

  const handleUnlock = async (walletId: string) => {
  try {
    await walletAPI.unlockWallet(walletId);
    message.success("Mở khóa ví thành công");
    fetchWallets();
  } catch (error: any) {
    message.error(error.message || "Mở khóa ví thất bại");
  }
};
  // 🔹 Columns bảng user + ví
  const columns = [
    {
        title: "Người dùng",
        key: "user",
        render: (record: Wallet) => {
          const user = record.user;

          // ✅ Nếu đã populate
          if (typeof user === "object" && user !== null) {
            return (
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{user.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user.email}
                  </Text>
                </div>
              </div>
            );
          }

          // ✅ Fallback an toàn (chưa populate)
          return (
            <div style={{ display: "flex", gap: 12 }}>
              <Avatar icon={<UserOutlined />} />
              <Text type="secondary">User ID: {String(user)}</Text>
            </div>
          );
        },
      },
    {
      title: "Số dư",
      dataIndex: "balance",
      align: "right",
      render: (v: number) => (
        <Text strong style={{ color: "#1677ff" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        align: "center",
        render: (_: any, record: Wallet) =>
          record.status === "active" ? (
            <Tag color="green">Hoạt động</Tag>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Tag color="red">Bị khóa</Tag>
              {record.lockedAt && (
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  Khóa lúc: {new Date(record.lockedAt).toLocaleString("vi-VN")}
                </div>
              )}
            </div>
          ),
      },
    {
      title: "Hành động",
      align: "center",
      render: (record: Wallet) => (
        <Space>
          {record.status === "active" ? (
            <Button
              danger
              size="small"
              onClick={() => {
                setSelectedWallet(record);
                setLockModalOpen(true);
              }}
            >
              Khóa ví
            </Button>
          ) : (
            <Popconfirm
              title="Mở khóa ví?"
              description="Bạn có chắc muốn mở khóa ví này không?"
              okText="Mở khóa"
              cancelText="Hủy"
              onConfirm={() => handleUnlock(record._id)}
            >
              <Button type="primary" size="small">
                Mở khóa
              </Button>
            </Popconfirm>
          )}

          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedWallet(record);
              setOpenDrawer(true);
              fetchTransactions(record._id);
            }}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    }
  ];

  return (
    <div>
      <Title level={3}>
        <WalletOutlined /> Quản lý ví người dùng
      </Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Số user có ví" value={wallets.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số dư hệ thống"
              value={wallets.reduce((s, w) => s + w.balance, 0)}
              formatter={(v) => formatCurrency(Number(v))}
            />
          </Card>
        </Col>
      </Row>

      {/* Wallet table */}
      <Card>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={wallets}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Drawer giao dịch */}
      <Drawer
        title="Chi tiết ví & giao dịch"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        width={720}
      >
        {selectedWallet && (
          <>
            <Text strong>Số dư:</Text>{" "}
            {formatCurrency(selectedWallet.balance)}
            <br />
            <Text strong>Trạng thái:</Text>{" "}
            {selectedWallet.status}
            <br />
            <br />

            <Table
              rowKey="_id"
              loading={loadingTx}
              dataSource={transactions}
              pagination={{ pageSize: 5 }}
              columns={[
                { title: "Loại", dataIndex: "type" },
                {
                  title: "Số tiền",
                  dataIndex: "amount",
                  render: formatCurrency,
                },
                { title: "Trạng thái", dataIndex: "status" },
                {
                  title: "Ngày",
                  dataIndex: "createdAt",
                  render: (v) =>
                    new Date(v).toLocaleString("vi-VN"),
                },
              ]}
            />
          </>
        )}
      </Drawer>

      <Modal
        title="Khóa ví người dùng"
        open={lockModalOpen}
        okText="Xác nhận khóa"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
          disabled: !lockReason,
          loading: actionLoading,
        }}
        onCancel={() => {
          setLockModalOpen(false);
          setLockReason("undefied");
        }}
        onOk={handleLockWallet}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>
            Chọn lý do khóa ví của{" "}
            <Text strong>
              {selectedWallet?.user?.email || "người dùng"}
            </Text>
          </Text>

          <Select
            style={{ width: "100%" }}
            placeholder="Chọn lý do khóa"
            value={lockReason}
            onChange={setLockReason}
            dropdownRender={(menu) => (
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {menu}
              </div>
            )}
          >
            {LOCK_REASONS.map((reason) => (
              <Select.Option key={reason} value={reason}>
                <div style={{ whiteSpace: "normal", lineHeight: "20px" }}>
                  {reason}
                </div>
              </Select.Option>
            ))}
          </Select>     
        </Space>
      </Modal>
    </div>
  );
};

export default WalletsPage;