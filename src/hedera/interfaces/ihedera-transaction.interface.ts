import { IHederaTransfer } from "./ihedera-transfer.interface";

export interface IHederaTransaction {
  charged_tx_fee: number;
  consensus_timestamp: string;
  entity_id: any;
  max_fee: string;
  memo_base64: string;
  node: string;
  name: string;
  result: string;
  transaction_hash: string;
  transaction_id: string;
  transfers: IHederaTransfer[];
  valid_duration_seconds: string;
  valid_start_timestamp: string;
}
