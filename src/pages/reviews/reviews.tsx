import { Button, Table } from "antd";
import { useState } from "react";

const products = [
  { id: 1, name: "Sách Tâm lý học" },
  { id: 2, name: "Sách Phát triển bản thân" },
  { id: 3, name: "Sách Lãng mạn" },
  { id: 4, name: "Sách Trinh thám" },
  { id: 5, name: "Sách Tiểu thuyết" },
];

const reviews = [
  { id: 101, users_id: 468, product_id: 1, rating: "⭐⭐⭐⭐", title: "Khá hài lòng", content: "Giá cả hợp lý!", imageUrl: "https://rg.com.vn/OuV1K"},
  { id: 102, users_id: 345, product_id: 1, rating: "⭐⭐⭐", title: "Bình thường", content: "Sp ok", imageUrl: "https://rg.com.vn/OuV1K"},
  { id: 103, users_id: 988, product_id: 2, rating: "⭐⭐⭐⭐⭐", title: "Hài lòng", content: "Sách hay, tập trung vào chủ đề chính", imageUrl: "https://rg.com.vn/MtZMq"},
  { id: 104, users_id: 678, product_id: 2, rating: "⭐⭐⭐⭐⭐", title: "Hài lòng", content: "Hay.", imageUrl: "https://rg.com.vn/MtZMq"},
  { id: 105, users_id: 567, product_id: 3, rating: "⭐⭐⭐⭐", title: "Khá hài lòng", content: "OK", imageUrl: "https://rg.com.vn/GrvKc"},
  { id: 106, users_id: 124, product_id: 4, rating: "⭐⭐⭐⭐", title: "Khá hài lòng", content: "Đọc rất hay nha mặc dù giao hơi lâu", imageUrl: "https://rg.com.vn/hqUew"},
  { id: 107, users_id: 981, product_id: 4, rating: "⭐⭐⭐⭐", title: "Khá hài lòng", content: "Ok Hay", imageUrl: "https://rg.com.vn/hqUew"},
  { id: 108, users_id: 246, product_id: 5, rating: "⭐", title: "Tệ", content: "Giao chậm, trả lời khách cục súc", imageUrl: "https://rg.com.vn/qHTdo"},
  { id: 109, users_id: 335, product_id: 5, rating: "⭐", title: "Tệ", content: "Thái độ với khách, màu sách không giống hình!", imageUrl: "https://rg.com.vn/qHTdo"},
];

const Reviews = () => {
  const [expandedRowKeys, setExpandedRowkeys] = useState<number[]>([])
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => {
          const alreadyExpanded = expandedRowKeys.includes(record.id);
          setExpandedRowkeys(alreadyExpanded ? [] : [record.id]);
        }}
        >
        {expandedRowKeys.includes(record.id) ? "Ẩn đánh giá" : "Xem đánh giá"}
        </Button>
      )
    }
  ];

  const reviewColumns = [
    {
      title: "Người dùng",
      dataIndex: "users_id",
      key: "users_id"
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating"
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title"
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content"
    },
    {
      title: "Ảnh đánh giá",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) => <img src={imageUrl} style={{ width: 40, height: 60, objectFit: "cover" }} />
    }
  ]

  return (
    <>
    <h1 style={{ marginBottom: 24 }}>Tổng hợp đánh giá</h1>
    <Table columns={columns} dataSource={products} rowKey="id" pagination={{pageSize: 2}} expandable={{
      expandedRowKeys,
      onExpand: (expanded, record) => {
        setExpandedRowkeys(expanded ? [record.id] : []);
      },
      expandedRowRender: (record) => {
        const review = reviews.filter((r) => r.product_id === record.id);
        return (
          <Table columns={reviewColumns} dataSource={review} pagination={false} rowKey="id" size="small" />
        )
      }
    }}/>
    </>
  )
}

export default Reviews