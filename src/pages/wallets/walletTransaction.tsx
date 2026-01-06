import { useState, useEffect } from 'react';
import { Table, Tag, Alert, App, Button, Modal, Upload, Form, Image} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '@/apis/wallets';
import { WalletTransaction } from '@/types/wallet';
import { API_BASE_URL } from '@/config/adminAxios';
import axios from "axios";
import { showNotification } from "../../utils/notification";
import dayjs from "dayjs";


const Wallets = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{totalDeposit: number;totalWithdraw: number;}>({totalDeposit: 0,totalWithdraw: 0,});
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch all transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAllTransactions();
      if (response.success) {
        const formattedData = response.data.map((transaction: WalletTransaction, index: number) => ({
          ...transaction,
          stt: index + 1,
          key: transaction._id,
        }));
        setTransactions(formattedData);
         if (response.summary) {
          setSummary(response.summary);
        }
        message.success(`Đã tải ${formattedData.length} giao dịch từ backend`);
      } else {
        message.error(response.message || 'Lỗi khi lấy danh sách giao dịch');
      }
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.message.includes('UNAUTHORIZED')) {
        message.error({
          content: 'Token admin hết hạn. Vui lòng đăng nhập lại.',
          duration: 5,
        });
      } else if (error.message.includes('FORBIDDEN')) {
        message.error('Tài khoản không có quyền admin.');
      } else if (error.message.includes('Route not found')) {
        message.warning({
          content: 'Backend chưa có route cho wallet transactions.',
          duration: 10,
        });
      } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        message.error('Backend server chưa khởi động.');
      } else {
        message.error('Không thể lấy danh sách giao dịch từ backend.');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  const uploadImage = async (file: File) => {
      if (!file) return;
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'reacttest');
  
      try {
        const { data } = await axios.post('https://api.cloudinary.com/v1_1/dkpfaleot/image/upload', formData);
        const url = data.secure_url || data.url;
        setImageUrl(url);
        form.setFieldsValue({ image_transaction: url });
        setLoading(false);
        return url;
      } catch (err) {
        message.error('Upload ảnh thất bại');
        setLoading(false);
        throw err;
      }
    };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApproveWithdraw = (transactionId: string) => {
  setSelectedTransaction(transactionId);
  setApproveModalOpen(true);
  };

  const submitApproveWithdraw = async () => {
    if (!imageUrl) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/walletTransaction/approveWithDrawal/${selectedTransaction}`,
        {
          image_transaction: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification("success", "Duyệt rút tiền thành công");
      setApproveModalOpen(false);
      setImageUrl(null);
      fetchTransactions();
    } catch (err: any) {
      showNotification("error", err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };


  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };
  const handleUploadImage = async (file: File) => {
  const url = await uploadImage(file);
  setImageUrl(url);
};

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'blue';
      case 'Thành công':
        return 'green';
      case 'Thất bại':
        return 'red';
      case 'Đã hủy':
        return 'default';
      default:
        return 'default';
    }
  };

  // Transaction columns
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (record: WalletTransaction) => (
        <div>
          <div><strong>{record.user?.name || 'N/A'}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.user?.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Nạp tiền' ? 'green' : 'red'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: WalletTransaction) => (
        <span style={{ 
          fontWeight: 'bold', 
          color: record.type === 'Nạp tiền' ? '#52c41a' : '#ff4d4f',
          fontSize: '16px'
        }}>
          {record.type === 'Nạp tiền' ? '+' : '-'}{formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: "Ảnh giao dịch",
      dataIndex: "image_transaction",
      key: "image_transaction",
      align: "center",
      render: (url: string) =>
        url ? (
          <Image
            width={50}
            src={url}
            style={{ borderRadius: 6 }}
            preview={{
              mask: "Xem ảnh",
            }}
          />
        ) : (
          <span>—</span>
        ),
    },
    {
      title: "Thời gian duyệt",
      dataIndex: "approvedWithDrawalAt",
      key: "approvedWithDrawalAt",
      align: "center",
      render: (value: string) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "—",
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: WalletTransaction) => {
        if (record.type === 'Rút tiền' && record.status === 'Chờ xử lý') {
          return (
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => handleApproveWithdraw(record._id)}
            >
              Duyệt
            </Button>
          );
        }

        return (
          <Tag color={record.status === 'Thành công' ? 'green' : 'default'}>
            {record.status === 'Thành công' ? 'Đã xử lý' : '—'}
          </Tag>
        );
      },
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1> Quản lý giao dịch</h1>
        <Button onClick={fetchTransactions} type="primary" loading={loading}>
            Làm mới
          </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Alert
          type="success"
          showIcon
          message="Tổng tiền nạp"
          description={
            <strong style={{ fontSize: 18 }}>
              {formatCurrency(summary.totalDeposit)}
            </strong>
          }
        />

        <Alert
          type="error"
          showIcon
          message="Tổng tiền rút"
          description={
            <strong style={{ fontSize: 18 }}>
              {formatCurrency(summary.totalWithdraw)}
            </strong>
          }
        />
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Duyệt lệnh nút"
        open={approveModalOpen}
        onCancel={() => {
          setApproveModalOpen(false);
          setImageUrl(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setApproveModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            disabled={!imageUrl}
            loading={loading}
            onClick={submitApproveWithdraw}
          >
            Xác nhận
          </Button>,
        ]}
      >
        <Upload
          beforeUpload={(file) => {
            handleUploadImage(file);
            return false;
          }}
          maxCount={1}
          accept="image/*"
        >
          <Button loading={loading}>Upload ảnh giao dịch</Button>
        </Upload>

        {imageUrl && (
          <div style={{ marginTop: 12 }}>
            <img src={imageUrl} alt="preview" style={{ width: "100%" }} />
          </div>
        )}
    </Modal>
    </div>


  );
};

export default Wallets;