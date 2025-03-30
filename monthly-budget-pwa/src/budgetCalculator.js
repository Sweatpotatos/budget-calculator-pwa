function BudgetCalculator() {
    this.expenses = [];
}

BudgetCalculator.prototype.addExpense = function(person, description, category, amount) {
    this.expenses.push({
        person: person,
        description: description,
        category: category,
        amount: parseFloat(amount)
    });
};

BudgetCalculator.prototype.calculateTotal = function() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
};

BudgetCalculator.prototype.getExpenses = function() {
    return this.expenses;
};

BudgetCalculator.prototype.clearExpenses = function() {
    this.expenses = [];
};

export default BudgetCalculator;