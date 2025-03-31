export class CreateCashDto {
  cash: {
    price: number;
    description: string;
    type: string;
    categoryId: string;
  };
  userId: string;
  accountId: string;
}
