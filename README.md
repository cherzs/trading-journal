# Tractional - Trading Journal & Strategy Backtester

A comprehensive web application for traders to track, analyze, and improve their trading performance. The application includes features for tracking trades, analyzing strategy performance, and generating visual statistics to enhance decision-making.

## Features

- **Trade Tracking**: Record detailed information about each trade, including entry/exit prices, stop loss, take profit, screenshots, and notes.
- **Performance Dashboard**: View key metrics like win rate, profit factor, and total P&L at a glance.
- **Strategy Analysis**: Evaluate which strategies work best through detailed breakdowns and visualizations.
- **Visual Statistics**: Interactive charts showing cumulative performance, strategy comparison, and win rate by day of the week.
- **User Authentication**: Secure login and registration system with Google OAuth support.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Python, Flask
- **Database**: CSV-based storage (can be upgraded to SQL)
- **Charts**: Chart.js
- **Authentication**: Flask-Login, Google OAuth 2.0, bcrypt for password hashing

## Project Structure

```
trading-journal/
│
├── App.py                # Main Flask application
├── requirements.txt      # Python dependencies
├── README.md             # Project documentation
├── .env                  # Environment variables (not tracked by git)
├── .gitignore            # Git ignore file
│
├── static/               # Static assets
│   ├── css/              # CSS styles
│   │   └── styles.css    # Custom styles
│   ├── js/               # JavaScript files
│   │   ├── main.js       # Main application logic
│   │   └── google-auth.js # Google authentication functionality
│   └── uploads/          # User uploaded files (screenshots)
│
├── data/                 # Data storage
│   └── trades.csv        # Trade records
│
└── templates/            # HTML templates for Flask
    ├── index.html        # Landing page
    ├── login.html        # Login page
    ├── register.html     # Registration page
    ├── dashboard.html    # Main dashboard
    ├── add_trade.html    # Add trade form
    ├── trades.html       # Trade listing page
    ├── trade_detail.html # Individual trade view
    └── settings.html     # User settings page
```

## Installation

1. Clone the repository
2. Create and configure the `.env` file:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the application:
   ```
   python App.py
   ```
5. Open your browser and navigate to `http://localhost:5000`

## Google OAuth Configuration

To enable Google Sign-In for your application:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID (Web application)
5. Add the following Authorized redirect URIs:
   - `http://localhost:5000/login/google/callback`
   - `http://127.0.0.1:5000/login/google/callback`
6. Add Authorized JavaScript origins:
   - `http://localhost:5000`
   - `http://127.0.0.1:5000`
7. Copy the Client ID and Client Secret to your `.env` file

## Environment Variables

The following environment variables can be configured in the `.env` file:

```
# Required for Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional email configuration (for verification emails)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-email-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

## Usage

1. Register a new account, sign in with Google, or use the demo account (email: demo@example.com, password: demo)
2. Navigate to the dashboard to view your trading performance
3. Add new trades using the "Add Trade" page
4. View all your trades in the "Trades" section
5. Analyze your performance with the provided charts and statistics
6. Adjust your settings in the "Settings" page

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- UI powered by [Tailwind CSS](https://tailwindcss.com/)
- Charts created with [Chart.js](https://www.chartjs.org/)
- Authentication with [Google Sign-In](https://developers.google.com/identity) 