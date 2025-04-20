import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import os
from datetime import datetime
import json

# Set page configuration
st.set_page_config(
    page_title="Trading Journal - Scalper Edition",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state for storing data
if "trades" not in st.session_state:
    # Try to load from file if exists
    data_file = "data/trades.csv"
    if os.path.exists(data_file):
        st.session_state.trades = pd.read_csv(data_file)
    else:
        # Create empty dataframe with predefined columns
        st.session_state.trades = pd.DataFrame(columns=[
            "date", "pair", "entry_price", "exit_price", "position_size",
            "stop_loss", "take_profit", "result_percent", "trade_result", 
            "strategy", "timeframe", "notes", "screenshot"
        ])

# Sidebar navigation
st.sidebar.title("📊 Scalper Trading Journal")
page = st.sidebar.radio("Navigation", ["Dashboard", "Add Trade", "View Trades", "Import/Export", "Settings"])

# Functions for trade calculations
def calculate_rr_ratio(entry, sl, tp):
    if not entry or not sl or not tp:
        return 0
    
    # Calculate based on direction
    if tp > entry:  # Long position
        risk = abs(entry - sl)
        reward = abs(tp - entry)
    else:  # Short position
        risk = abs(entry - sl)
        reward = abs(entry - tp)
    
    if risk == 0:
        return 0
    return round(reward / risk, 2)

def calculate_profit_loss(entry, exit, position_size, is_long=True):
    if not entry or not exit or not position_size:
        return 0
    
    if is_long:
        return ((exit - entry) / entry) * 100
    else:
        return ((entry - exit) / entry) * 100

# Dashboard page
if page == "Dashboard":
    st.title("Trading Performance Dashboard")
    
    if len(st.session_state.trades) == 0:
        st.info("No trades yet. Add some trades to see your performance metrics.")
    else:
        # Basic metrics
        col1, col2, col3, col4 = st.columns(4)
        
        # Calculate metrics
        total_trades = len(st.session_state.trades)
        winning_trades = len(st.session_state.trades[st.session_state.trades["trade_result"] == "Win"])
        losing_trades = len(st.session_state.trades[st.session_state.trades["trade_result"] == "Loss"])
        
        if total_trades > 0:
            winrate = (winning_trades / total_trades) * 100
            avg_profit = st.session_state.trades[st.session_state.trades["trade_result"] == "Win"]["result_percent"].mean() if winning_trades > 0 else 0
            avg_loss = st.session_state.trades[st.session_state.trades["trade_result"] == "Loss"]["result_percent"].mean() if losing_trades > 0 else 0
            
            col1.metric("Total Trades", total_trades)
            col2.metric("Winrate", f"{winrate:.2f}%")
            col3.metric("Avg Win", f"{avg_profit:.2f}%")
            col4.metric("Avg Loss", f"{avg_loss:.2f}%")
            
            # Main charts
            st.header("Performance Analysis")
            tab1, tab2, tab3 = st.tabs(["Equity Curve", "Win/Loss Distribution", "Strategy Performance"])
            
            with tab1:
                # Create equity curve
                df = st.session_state.trades.copy()
                if "date" in df.columns:
                    df["date"] = pd.to_datetime(df["date"])
                    df = df.sort_values("date")
                
                df["cumulative_result"] = df["result_percent"].cumsum()
                
                fig = px.line(df, x="date", y="cumulative_result", 
                             title="Equity Curve",
                             labels={"cumulative_result": "Cumulative Return (%)", "date": "Date"})
                st.plotly_chart(fig, use_container_width=True)
            
            with tab2:
                # Win/Loss pie chart
                win_loss_data = df["trade_result"].value_counts()
                fig = px.pie(values=win_loss_data.values, names=win_loss_data.index, 
                            title="Win/Loss Distribution",
                            color_discrete_sequence=["#4CAF50", "#F44336"])
                st.plotly_chart(fig, use_container_width=True)
                
                # Result distribution histogram
                fig = px.histogram(df, x="result_percent", 
                                  title="Profit/Loss Distribution",
                                  labels={"result_percent": "Trade Result (%)"})
                st.plotly_chart(fig, use_container_width=True)
            
            with tab3:
                if "strategy" in df.columns:
                    # Strategy performance
                    strategy_data = df.groupby("strategy").agg(
                        win_count=("trade_result", lambda x: (x == "Win").sum()),
                        loss_count=("trade_result", lambda x: (x == "Loss").sum()),
                        total_return=("result_percent", "sum")
                    ).reset_index()
                    
                    strategy_data["total_trades"] = strategy_data["win_count"] + strategy_data["loss_count"]
                    strategy_data["winrate"] = (strategy_data["win_count"] / strategy_data["total_trades"]) * 100
                    
                    # Bar chart of strategy winrates
                    fig = px.bar(strategy_data, x="strategy", y="winrate", 
                                text=strategy_data["winrate"].round(1).astype(str) + "%",
                                title="Strategy Winrate (%)",
                                color="total_return",
                                color_continuous_scale="RdYlGn")
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Strategy summary table
                    st.dataframe(strategy_data[["strategy", "win_count", "loss_count", 
                                               "total_trades", "winrate", "total_return"]])
                else:
                    st.info("No strategy data available.")

# Add Trade page
elif page == "Add Trade":
    st.title("Add New Trade")
    
    with st.form("trade_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            date = st.date_input("Date", datetime.now())
            pair = st.text_input("Trading Pair (e.g., BTC/USDT)")
            
            position_type = st.radio("Position Type", ["Long", "Short"])
            is_long = position_type == "Long"
            
            entry_price = st.number_input("Entry Price", min_value=0.0, format="%.5f")
            exit_price = st.number_input("Exit Price", min_value=0.0, format="%.5f")
            position_size = st.number_input("Position Size", min_value=0.0)
            
        with col2:
            stop_loss = st.number_input("Stop Loss Price", min_value=0.0, format="%.5f")
            take_profit = st.number_input("Take Profit Price", min_value=0.0, format="%.5f")
            
            # Calculate RR ratio
            rr_ratio = 0
            if entry_price > 0 and stop_loss > 0 and take_profit > 0:
                rr_ratio = calculate_rr_ratio(entry_price, stop_loss, take_profit)
            
            st.metric("Risk-Reward Ratio", f"{rr_ratio:.2f}")
            
            strategy = st.selectbox("Strategy", [
                "Price Action", "EMA Cross", "Support/Resistance", "SMC (Smart Money Concept)", 
                "Breakout", "Fibonacci", "RSI Divergence", "Other"
            ])
            
            timeframe = st.selectbox("Timeframe", [
                "1m", "5m", "15m", "30m", "1h", "4h", "Daily", "Weekly"
            ])
        
        # Result calculation
        result_percent = 0
        if entry_price > 0 and exit_price > 0:
            result_percent = calculate_profit_loss(entry_price, exit_price, position_size, is_long)
        
        trade_result = "Win" if result_percent > 0 else "Loss"
        
        notes = st.text_area("Trade Notes")
        
        # File uploader for screenshot
        screenshot = st.file_uploader("Upload Chart Screenshot (optional)", type=["png", "jpg", "jpeg"])
        
        submitted = st.form_submit_button("Save Trade")
        
        if submitted:
            # Create trade record
            trade = {
                "date": date.strftime("%Y-%m-%d"),
                "pair": pair,
                "entry_price": entry_price,
                "exit_price": exit_price,
                "position_size": position_size,
                "stop_loss": stop_loss,
                "take_profit": take_profit,
                "result_percent": result_percent,
                "trade_result": trade_result,
                "strategy": strategy,
                "timeframe": timeframe,
                "notes": notes,
                "screenshot": screenshot.name if screenshot else ""
            }
            
            # Add to dataframe
            st.session_state.trades = pd.concat([st.session_state.trades, pd.DataFrame([trade])], ignore_index=True)
            
            # Save to file
            os.makedirs("data", exist_ok=True)
            st.session_state.trades.to_csv("data/trades.csv", index=False)
            
            # Save screenshot if provided
            if screenshot:
                os.makedirs("data/screenshots", exist_ok=True)
                with open(f"data/screenshots/{screenshot.name}", "wb") as f:
                    f.write(screenshot.getvalue())
            
            st.success("Trade saved successfully!")

# View Trades page
elif page == "View Trades":
    st.title("Trade History")
    
    if len(st.session_state.trades) == 0:
        st.info("No trades yet. Add some trades first.")
    else:
        # Filters
        col1, col2, col3 = st.columns(3)
        with col1:
            filter_strategy = st.multiselect("Filter by Strategy", 
                                            options=st.session_state.trades["strategy"].unique())
        with col2:
            filter_result = st.multiselect("Filter by Result", 
                                          options=st.session_state.trades["trade_result"].unique())
        with col3:
            filter_pair = st.multiselect("Filter by Pair", 
                                        options=st.session_state.trades["pair"].unique())
        
        # Apply filters
        df = st.session_state.trades.copy()
        
        if filter_strategy:
            df = df[df["strategy"].isin(filter_strategy)]
        if filter_result:
            df = df[df["trade_result"].isin(filter_result)]
        if filter_pair:
            df = df[df["pair"].isin(filter_pair)]
        
        # Sort by date (newest first)
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"])
            df = df.sort_values("date", ascending=False)
        
        # Display trades
        st.dataframe(
            df.drop(columns=["screenshot"]), 
            use_container_width=True,
            column_config={
                "result_percent": st.column_config.NumberColumn(
                    "Result (%)",
                    format="%.2f%%",
                ),
                "date": st.column_config.DateColumn("Date"),
            }
        )
        
        # Delete trade functionality
        if st.button("Delete Selected Trade"):
            selected_indices = st.session_state.get("selected_rows", [])
            if selected_indices:
                st.session_state.trades = st.session_state.trades.drop(selected_indices).reset_index(drop=True)
                st.session_state.trades.to_csv("data/trades.csv", index=False)
                st.success("Selected trades deleted.")
                st.rerun()

# Import/Export page
elif page == "Import/Export":
    st.title("Import/Export Data")
    
    tab1, tab2 = st.tabs(["Import", "Export"])
    
    with tab1:
        st.header("Import Trades")
        
        import_option = st.radio("Import from:", ["CSV File", "Excel File"])
        
        uploaded_file = st.file_uploader("Upload file", type=["csv", "xlsx"])
        
        if uploaded_file is not None:
            try:
                if import_option == "CSV File":
                    imported_data = pd.read_csv(uploaded_file)
                else:
                    imported_data = pd.read_excel(uploaded_file)
                
                st.dataframe(imported_data)
                
                if st.button("Confirm Import"):
                    st.session_state.trades = pd.concat([st.session_state.trades, imported_data], ignore_index=True)
                    st.session_state.trades.to_csv("data/trades.csv", index=False)
                    st.success("Data imported successfully!")
                    
            except Exception as e:
                st.error(f"Error importing data: {e}")
    
    with tab2:
        st.header("Export Trades")
        
        export_format = st.radio("Export as:", ["CSV", "Excel"])
        
        if st.button("Export Data"):
            if len(st.session_state.trades) == 0:
                st.warning("No data to export.")
            else:
                try:
                    if export_format == "CSV":
                        csv = st.session_state.trades.to_csv(index=False)
                        st.download_button(
                            label="Download CSV",
                            data=csv,
                            file_name="trading_journal_export.csv",
                            mime="text/csv",
                        )
                    else:
                        # Create Excel file in memory
                        output = pd.ExcelWriter("data/temp_export.xlsx", engine="openpyxl")
                        st.session_state.trades.to_excel(output, index=False)
                        output.save()
                        
                        with open("data/temp_export.xlsx", "rb") as f:
                            excel_data = f.read()
                            
                        st.download_button(
                            label="Download Excel",
                            data=excel_data,
                            file_name="trading_journal_export.xlsx",
                            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        )
                        
                except Exception as e:
                    st.error(f"Error exporting data: {e}")

# Settings page
elif page == "Settings":
    st.title("Settings")
    
    st.header("Appearance")
    theme = st.selectbox("Theme", ["Light", "Dark"])
    
    st.header("Data Management")
    if st.button("Clear All Data"):
        st.warning("This will delete all your trade data. Are you sure?")
        if st.button("Yes, I'm sure", key="confirm_delete"):
            st.session_state.trades = pd.DataFrame(columns=[
                "date", "pair", "entry_price", "exit_price", "position_size",
                "stop_loss", "take_profit", "result_percent", "trade_result", 
                "strategy", "timeframe", "notes", "screenshot"
            ])
            if os.path.exists("data/trades.csv"):
                os.remove("data/trades.csv")
            st.success("All data cleared successfully!")
    
    st.header("About")
    st.write("Trading Journal + Strategy Backtester for Scalpers")
    st.write("Version 1.0.0")
    st.write("Created with ❤️ for scalp traders") 