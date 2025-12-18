export type AppStackParamList = {
  Main: undefined;
  AllCurrencies: undefined;
  BalanceTopUp: undefined;
  Exchange: {
    coinId: string;       
    symbol: string;       
    name: string;         
    currentPrice: string; 
    priceChange: string;  
    ownedAmount: number;  
  };
  PaymentMethod: undefined;
  Wallet: undefined;
  TransactionHistory: undefined
};
