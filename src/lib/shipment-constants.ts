export const SHIPMENT_STATUSES = [
  "unfulfilled",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const CARRIERS = [
  "PostNL",
  "DHL",
  "DPD",
  "UPS",
  "FedEx",
  "GLS",
  "Other",
] as const;

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

export function shipmentStatusLabel(status: string) {
  switch (status) {
    case "unfulfilled":
    case "preparing":
      return "Unfulfilled";
    case "shipped":
    case "delivered":
      return "Shipped";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
