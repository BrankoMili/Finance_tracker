interface Props {
  params: { id: string };
}

export default async function ExpensesPage({ params }: Props) {
  const expenses = {
    id: params.id,
    amount: 100,
    description: "Groceries"
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Transaction #{expenses.id}</h1>
      <p className="mt-4">Amount: ${expenses.amount}</p>
      <p>Description: {expenses.description}</p>
    </div>
  );
}
