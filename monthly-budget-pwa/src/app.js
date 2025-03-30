import BudgetCalculator from './budgetCalculator.js';
import { db, collection, addDoc, getDocs } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-display');
    const individualTotalsContainer = document.getElementById('individual-totals');

    const calculator = new BudgetCalculator();

    // Load existing expenses from Firestore on startup:
    async function loadExpenses() {
        try {
            const querySnapshot = await getDocs(collection(db, "expenses"));
            querySnapshot.forEach(doc => {
                const expense = doc.data();
                calculator.addExpense(expense.person, expense.name, expense.category, expense.amount);
            });
            updateExpenseList();
            updateTotal();
            updateIndividualTotals();
        } catch (error) {
            console.error("Error loading expenses:", error);
        }
    }
    loadExpenses();

    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("Submit event fired");
        const formData = new FormData(expenseForm);
        const person = formData.get('person');
        const name = formData.get('name');
        const category = formData.get('category');
        const amount = parseFloat(formData.get('amount'));

        // Validate input (expense name is optional)
        if (!person || !category || isNaN(amount)) {
            console.error('Invalid input:', { person, name, category, amount });
            return;
        }
        
        // Save expense to Firestore:
        try {
            await addDoc(collection(db, "expenses"), {
                person,
                name,
                category,
                amount,
                timestamp: new Date()
            });
            console.log("Expense added to Firebase");
        } catch (error) {
            console.error("Error adding expense to Firebase:", error);
        }
        
        // Update UI locally:
        calculator.addExpense(person, name, category, amount);
        updateExpenseList();
        updateTotal();
        updateIndividualTotals();
        expenseForm.reset();
    });

    function updateExpenseList() {
        const expenses = calculator.getExpenses();
        expenseList.innerHTML = '';
        expenses.forEach(expense => {
            const li = document.createElement('li');
            const descriptionText = expense.description ? ` (${expense.description})` : '';
            li.textContent = `${expense.person} spent $${expense.amount.toFixed(2)} on ${expense.category}${descriptionText}`;
            expenseList.appendChild(li);
        });
    }

    function updateTotal() {
        const total = calculator.calculateTotal();
        totalDisplay.textContent = `Overall Total: $${total.toFixed(2)}`;
    }

    function updateIndividualTotals() {
        const expenses = calculator.getExpenses();
        const totalsByPerson = {};
        expenses.forEach(expense => {
            totalsByPerson[expense.person] = (totalsByPerson[expense.person] || 0) + expense.amount;
        });
        individualTotalsContainer.innerHTML = '<h3>Individual Totals:</h3>';
        Object.entries(totalsByPerson).forEach(([person, total]) => {
            const p = document.createElement('p');
            p.textContent = `${person}: $${total.toFixed(2)}`;
            individualTotalsContainer.appendChild(p);
        });
    }

    // Calculator functionality for the 'amount' input:
    const amountInput = document.getElementById('amount');
    const calcModal = document.getElementById('calc-modal');
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('.calc-buttons button');
    const calcClear = document.getElementById('calc-clear');
    const calcEquals = document.getElementById('calc-equals');

    // When amount field gets focus, open the calculator:
    amountInput.addEventListener('focus', () => {
        calcModal.style.display = 'block';
        calcDisplay.textContent = '';
    });

    // Append button values to the calculator display:
    calcButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Only append if button has a data-value attribute
            const value = button.getAttribute('data-value');
            if (value) {
                calcDisplay.textContent += value;
            }
        });
    });

    // Clear the calculator display:
    calcClear.addEventListener('click', () => {
        calcDisplay.textContent = '';
    });

    // When equals is clicked, evaluate the expression:
    calcEquals.addEventListener('click', () => {
        try {
            // Evaluate the expression (for demo purposes; in production consider a safe parser)
            const result = eval(calcDisplay.textContent);
            // Set the result to the amount input and close the modal:
            amountInput.value = result;
            calcModal.style.display = 'none';
        } catch (error) {
            calcDisplay.textContent = 'Error';
        }
    });
});