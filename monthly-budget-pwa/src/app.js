import BudgetCalculator from './budgetCalculator.js';
import { db, collection, addDoc, getDocs, setDoc, doc, deleteDoc, onSnapshot } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-display');
    const individualTotalsContainer = document.getElementById('Year-to-Date-Total');

    const calculator = new BudgetCalculator();

    // Load existing expenses from Firestore on startup:
    async function loadExpenses() {
        try {
            const querySnapshot = await getDocs(collection(db, "expenses"));
            querySnapshot.forEach(docSnap => {
                const expense = docSnap.data();
                calculator.addExpense(expense.person, expense.name, expense.category, expense.amount, expense.date);
            });
            updateExpenseList();
            updateTotal();
            updateIndividualTotals();
            updateMonthlyTotals();
        } catch (error) {
            console.error("Error loading expenses:", error);
        }
    }
    loadExpenses();

    // Add Expense Form Submission (with optimistic local update):
    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(expenseForm);
        const person = formData.get('person');
        const name = formData.get('name');
        const category = formData.get('category');
        const amount = parseFloat(formData.get('amount'));
        const expenseDate = formData.get('expense-date') || new Date().toISOString().slice(0, 10);

        if (!person || !category || isNaN(amount) || !expenseDate) {
            console.error('Invalid input:', { person, name, category, amount, expenseDate });
            return;
        }

        // Immediately add the new expense to local state (mark as pending):
        calculator.addExpense(person, name, category, amount, expenseDate, true);
        updateExpenseList();
        updateTotal();
        updateIndividualTotals();
        updateMonthlyTotals();
        expenseForm.reset();

        // Queue the write to Firestore:
        addDoc(collection(db, "expenses"), {
            person,
            name,
            category,
            amount,
            date: expenseDate,
            timestamp: new Date()
        }).then(docRef => {
            console.log("Expense added to Firebase", docRef.id);
        }).catch(error => {
            console.error("Error adding expense to Firebase:", error);
        });
    });

    // Delete an expense by its document id:
    async function deleteExpense(expenseId) {
        try {
            await deleteDoc(doc(db, "expenses", expenseId));
            console.log("Expense deleted:", expenseId);
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    }

    // Updated function to render expenses from Firestore snapshot
    function updateExpenseListFromSnapshot(snapshot) {
        expenseList.innerHTML = '';
        snapshot.forEach(docSnapshot => {
            const expense = docSnapshot.data();
            const expenseId = docSnapshot.id;
            // Use metadata to detect pending writes (if any)
            const isPending = docSnapshot.metadata.hasPendingWrites;

            // Create a card for the expense:
            const card = document.createElement('div');
            card.className = 'expense-card';
            card.innerHTML = `
                <div class="expense-details">
                    <span class="expense-person"><strong>${expense.person}</strong></span>
                    <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
                    <span class="expense-meta"> on ${expense.category}<br>Date: ${expense.date}</span>
                    <span class="expense-status" style="color: ${isPending ? 'orange' : 'green'};">
                        ${isPending ? 'Pending' : 'Added Successfully'}
                    </span>
                </div>
                <button class="delete-btn" data-id="${expenseId}">Delete</button>
            `;
            expenseList.appendChild(card);
        });

        // Attach listeners on delete buttons:
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteExpense(id);
            });
        });
    }

    // Set up a real-time listener that includes metadata changes
    onSnapshot(
        collection(db, "expenses"),
        { includeMetadataChanges: true },
        snapshot => {
            updateExpenseListFromSnapshot(snapshot);
        }
    );

    function updateTotal() {
        const total = calculator.calculateTotal();
        totalDisplay.textContent = `HouseHold Total: $${total.toFixed(2)}`;
    }

    function updateIndividualTotals() {
        const expenses = calculator.getExpenses();
        const totalsByPerson = {};
        expenses.forEach(expense => {
            totalsByPerson[expense.person] = (totalsByPerson[expense.person] || 0) + expense.amount;
        });
        individualTotalsContainer.innerHTML = '<h3>Year to Date Individual Totals:</h3>';
        Object.entries(totalsByPerson).forEach(([person, total]) => {
            const p = document.createElement('p');
            p.textContent = `${person}: $${total.toFixed(2)}`;
            individualTotalsContainer.appendChild(p);
        });
    }

    function updateMonthlyTotals() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedStart = startDate.toLocaleDateString(undefined, options);
        const formattedEnd = endDate.toLocaleDateString(undefined, options);
        const monthlyTotals = calculator.calculateMonthlyTotals(month, year);
        const monthlyTotalsContainer = document.getElementById('monthly-totals');

        monthlyTotalsContainer.innerHTML = `<h3>Monthly Totals (from ${formattedStart} to ${formattedEnd}):</h3>`;
        Object.entries(monthlyTotals).forEach(([person, total]) => {
            const goal = calculator.monthlyGoals[person] || 0;
            let text = `${person}: $${total.toFixed(2)}`;
            if (goal) {
                text += ` (Goal: $${goal.toFixed(2)})`;
                if (total >= goal) {
                    text += ` - Warning: Exceeds monthly goal!`;
                }
            }
            const p = document.createElement('p');
            p.textContent = text;
            monthlyTotalsContainer.appendChild(p);
        });
    }

    // Calculator functionality for the 'amount' input:
    const amountInput = document.getElementById('amount');
    const calcModal = document.getElementById('calc-modal');
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('.calc-buttons button');
    const calcClear = document.getElementById('calc-clear');
    const calcEquals = document.getElementById('calc-equals');
    const calcDelete = document.getElementById('calc-delete');

    // Replace the current focus listener with a click listener:
    amountInput.addEventListener('click', (event) => {
        // Prevent multiple openings when clicking inside modal from the input
        event.stopPropagation();
        calcModal.style.display = 'block';
        calcDisplay.textContent = '';
    });

    // Add a document-level click listener to hide the modal if clicked outside:
    document.addEventListener('click', (event) => {
        if (event.target !== amountInput && !calcModal.contains(event.target)) {
            calcModal.style.display = 'none';
        }
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

    // Delete the last character from the calculator display:
    calcDelete.addEventListener('click', () => {
        // Remove the last character from the display text
        calcDisplay.textContent = calcDisplay.textContent.slice(0, -1);
    });

    const monthlyGoalForm = document.getElementById('monthly-goal-form');
    monthlyGoalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const person = e.target.elements['goal-person'].value;
        const goal = parseFloat(e.target.elements['goal-amount'].value);
        if (person && !isNaN(goal)) {
            try {
                // Use person's uppercase value as document id:
                const goalDocRef = doc(db, "monthlyGoals", person.toUpperCase());
                await setDoc(goalDocRef, { person: person.toUpperCase(), goal: goal });
                // Update our local calculator:
                calculator.setMonthlyGoal(person, goal);
                updateMonthlyTotals();
            } catch (error) {
                console.error("Error setting monthly goal:", error);
            }
        }
        monthlyGoalForm.reset();
    });
});