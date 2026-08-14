import medialaneAbiJson from "@/src/lib/abi/medialane.json";

export const MedialaneABI = medialaneAbiJson.abi;

export enum OrderStatus {
  None = 0,
  Created = 1,
  Filled = 2,
  Cancelled = 3,
}

export enum ItemType {
  NATIVE = 0,
  ERC20 = 1,
  ERC721 = 2,
  ERC1155 = 3,
}

export interface OfferItem {
  item_type: ItemType;
  token: string;
  identifier_or_criteria: string;
  start_amount: string;
  end_amount: string;
}

export interface ConsiderationItem {
  item_type: ItemType;
  token: string;
  identifier_or_criteria: string;
  start_amount: string;
  end_amount: string;
  recipient: string;
}

export interface OrderParameters {
  offerer: string;
  offer: OfferItem;
  consideration: ConsiderationItem;
  start_time: string;
  end_time: string;
  salt: string;
  nonce: string;
}

export interface Order {
  parameters: OrderParameters;
  signature: string[];
}

export interface OrderDetails {
  offerer: string;
  offer: OfferItem;
  consideration: ConsiderationItem;
  start_time: number;
  end_time: number;
  order_status: OrderStatus;
  fulfiller?: string;
}

export interface OrderFulfillment {
  order_hash: string;
  fulfiller: string;
  nonce: string;
}

export interface FulfillmentRequest {
  fulfillment: OrderFulfillment;
  signature: string[];
}

export interface OrderCancellation {
  order_hash: string;
  offerer: string;
  nonce: string;
}

export interface CancelRequest {
  cancelation: OrderCancellation;
  signature: string[];
}
