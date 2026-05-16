import * as React from 'react';

export interface EmailTemplateProps {
  orderItems: { name: string; quantity: number; price: number }[];
  totalPrice: number;
}

export function EmailTemplate({ orderItems, totalPrice }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#111', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
        New Order Received
      </h1>
      <p style={{ color: '#555', marginBottom: '30px' }}>
        A new order has been placed from the Karabak Restaurant Menu.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111', textAlign: 'left' }}>
            <th style={{ padding: '12px 8px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Item</th>
            <th style={{ padding: '12px 8px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '12px 8px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{item.name}</td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right' }}>{item.price * item.quantity} GEL</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '2px solid #111', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', color: '#555' }}>Order Total</h2>
        <h2 style={{ margin: 0, fontSize: '24px' }}>{totalPrice} GEL</h2>
      </div>
    </div>
  );
}