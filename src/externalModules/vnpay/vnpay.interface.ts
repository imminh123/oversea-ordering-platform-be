export interface VietQrResponse {
  code: string;
  desc: string;
  data?:
    | {
        acpId: number;
        accountName: string;
        qrCode: string;
        qrDataUrl: string;
      }
    | object[];
}
export interface VietQrInstance {
  getBanks: () => Promise<VietQrResponse>;
  genQRCodeBase64: (
    data: GenQRCodeBase64Request,
  ) => Promise<{ data: VietQrResponse }>;
}
export interface GenQRCodeBase64Request {
  accountNumber: string;
  accountName: string;
  bank: number;
  amount: number;
  memo: string;
  template: string;
}
