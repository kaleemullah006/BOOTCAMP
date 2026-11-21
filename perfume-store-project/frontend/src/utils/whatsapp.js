const formatPrice = (n) => `PKR ${Number(n).toLocaleString()}`;

export function buildOrderMessage(order) {
  const itemLines = order.items.map(
    (item, i) =>
      `${i + 1}. ${item.name} x ${item.qty} = ${formatPrice(item.price * item.qty)}`
  );

  return [
    "Assalam o Alaikum! I have placed an order on AF Perfumes.",
    "",
    `Order No: ${order.orderNumber}`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `City: ${order.customer.city}`,
    `Address: ${order.customer.address}`,
    order.customer.note ? `Note: ${order.customer.note}` : null,
    "",
    "Items:",
    ...itemLines,
    "",
    `Total: ${formatPrice(order.total)} (Cash on Delivery)`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function getWhatsAppLink(message) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}