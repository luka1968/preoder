import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Preorders() {
  const [preorders, setPreorders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreorders();
  }, []);

  const fetchPreorders = async () => {
    try {
      const response = await fetch('/api/preorders/list');
      const data = await response.json();
      setPreorders(data.preorders || []);
    } catch (error) {
      console.error('获取预购列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>预购订单管理 - PreOrder Pro</title>
      </Head>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>📦 预购订单管理</h1>
        
        {loading ? (
          <p>加载中...</p>
        ) : preorders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f8f9fa', borderRadius: '12px' }}>
            <p style={{ fontSize: '48px', marginBottom: '20px' }}>📭</p>
            <h2>暂无预购订单</h2>
            <p style={{ color: '#666' }}>当客户提交预购时，订单会显示在这里</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>客户邮箱</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>客户姓名</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>产品ID</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>状态</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {preorders.map((preorder) => (
                  <tr key={preorder.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '15px' }}>{preorder.id}</td>
                    <td style={{ padding: '15px' }}>{preorder.customer_email}</td>
                    <td style={{ padding: '15px' }}>{preorder.customer_name || '-'}</td>
                    <td style={{ padding: '15px' }}>{preorder.product_id}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: preorder.status === 'pending' ? '#fff3cd' : '#d4edda',
                        color: preorder.status === 'pending' ? '#856404' : '#155724',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {preorder.status === 'pending' ? '待处理' : '已完成'}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {new Date(preorder.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
