# Monthly Budget PWA

This project is a Progressive Web App (PWA) designed to help users calculate and manage their monthly budget. It allows users to track their expenses, view totals, and share their budget with friends. The app works both online and offline, providing a seamless experience.

## Features

- Calculate monthly budget
- Add and manage expenses
- View total expenses
- Offline functionality
- Share budget with friends

## Project Structure

```
monthly-budget-pwa
├── public
│   ├── index.html        # Main HTML document
│   ├── manifest.json     # PWA metadata
│   └── sw.js             # Service worker for offline support
├── src
│   ├── app.js            # Entry point of the application
│   ├── budgetCalculator.js # Logic for budget calculations
│   └── styles.css        # Styles for the application
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/monthly-budget-pwa.git
   ```

2. Navigate to the project directory:
   ```
   cd monthly-budget-pwa
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the application:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the app.

## Usage

- Open the app in your browser or install it on your device.
- Use the interface to add expenses and view your monthly budget.
- Share your budget with friends using the sharing options provided.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.