export class CreateCashDto {
  cash: {
    price: number;
    description: string;
    type: string;
    categoryId: string;
    icon?: string;
    color?: string;
  };
  userId: string;
  accountId: string;
}
