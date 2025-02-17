import ExpenseForm from "@/components/ExpenseForm";
import ExpenseShortList from "@/components/ExpenseShortList";

export default function Home() {
  return (
    <div>
      <main className="ml-auto mr-auto rounded-tr-xl rounded-br-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ExpenseForm />
            <ExpenseShortList />
          </div>

          <div className="lg:col-span-1"></div>
        </div>
      </main>
    </div>
  );
}
