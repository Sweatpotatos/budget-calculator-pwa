function BudgetCalculator() {
    this.expenses = [];
    this.monthlyGoals = {}; // Mapping of person (upper case) => monthly goal value
}

BudgetCalculator.prototype.addExpense = function(person, description, category, amount, date, pending = false) {
    // Always convert person to upper case:
    this.expenses.push({
        person: person.toUpperCase(),
        description: description,
        category: category,
        amount: parseFloat(amount),
        date: date,  // Store the expense date
        pending: pending
    });
};

BudgetCalculator.prototype.setMonthlyGoal = function(person, goal) {
    // Store goal for the person in upper case format
    this.monthlyGoals[person.toUpperCase()] = parseFloat(goal);
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

BudgetCalculator.prototype.calculateMonthlyTotals = function(month, year) {
    const totals = {};
    // Create start and end dates for the month
    const startDate = new Date(year, month - 1, 1); // first day of the month
    const endDate = new Date(year, month, 0); // last day of the month

    this.expenses.forEach(exp => {
        // Convert the expense date to a Date object
        const expenseDate = new Date(exp.date + "T00:00");
        // Check if expenseDate falls within the current month (inclusive)
        if (expenseDate >= startDate && expenseDate <= endDate) {
            totals[exp.person] = (totals[exp.person] || 0) + exp.amount;
        }
    });
    return totals;
};

export default BudgetCalculator;