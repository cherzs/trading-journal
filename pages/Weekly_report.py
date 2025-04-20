import streamlit as st
import pandas as pd
import plotly.express as px
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.trade_analysis import calculate_weekly_performance, get_trade_streaks, calculate_risk_metrics

st.set_page_config(
    page_title="Weekly Report - Trading Journal",
    page_icon="📈",
    layout="wide"
)

# Title
st.title("📊 Weekly Performance Report")

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

# If no trades, show message
if len(st.session_state.trades) == 0:
    st.info("No trades yet. Add some trades to see weekly performance reports.")
else:
    # Convert date column to datetime if needed
    df = st.session_state.trades.copy()
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
    
    # Get weekly performance data
    weekly_data = calculate_weekly_performance(df)
    
    # Filter to show only the latest few weeks
    num_weeks_to_show = st.slider("Number of weeks to show", 1, len(weekly_data), min(4, len(weekly_data)))
    latest_weeks = weekly_data.sort_values(["year", "week"], ascending=False).head(num_weeks_to_show)
    
    # Select a specific week for detailed analysis
    selected_week_idx = st.selectbox(
        "Select week for detailed analysis:",
        options=range(len(latest_weeks)),
        format_func=lambda i: f"Week {latest_weeks.iloc[i]['week']} of {latest_weeks.iloc[i]['year']} ({latest_weeks.iloc[i]['start_date'].strftime('%d %b')} - {latest_weeks.iloc[i]['end_date'].strftime('%d %b')})"
    )
    
    selected_week = latest_weeks.iloc[selected_week_idx]
    
    # Filter data for the selected week
    selected_week_start = selected_week["start_date"]
    selected_week_end = selected_week["end_date"]
    week_trades = df[(df["date"] >= selected_week_start) & (df["date"] <= selected_week_end)]
    
    # Display summary metrics for the selected week
    st.header(f"Week {selected_week['week']} of {selected_week['year']} Performance")
    
    col1, col2, col3, col4 = st.columns(4)
    
    col1.metric("Total Trades", selected_week["trade_count"])
    col2.metric("Winrate", f"{selected_week['winrate']:.2f}%")
    col3.metric("Total P&L", f"{selected_week['total_profit']:.2f}%")
    col4.metric("Avg Trade", f"{selected_week['avg_profit']:.2f}%")
    
    # Show trade streak info
    streak_info = get_trade_streaks(week_trades)
    
    # Risk metrics for the week
    risk_metrics = calculate_risk_metrics(week_trades)
    
    # Display additional metrics
    st.subheader("Additional Metrics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    col1.metric("Best Streak", f"{streak_info['max_win_streak']} wins")
    col2.metric("Worst Streak", f"{streak_info['max_loss_streak']} losses")
    col3.metric("Current Streak", f"{streak_info['current_streak']} {streak_info['current_streak_type'].lower()}")
    col4.metric("Profit Factor", f"{risk_metrics['profit_factor']:.2f}")
    
    # Show trades for the week
    st.subheader("Trades for the Week")
    st.dataframe(
        week_trades.drop(columns=["screenshot"]).sort_values("date", ascending=False),
        use_container_width=True,
        column_config={
            "result_percent": st.column_config.NumberColumn(
                "Result (%)",
                format="%.2f%%",
            ),
            "date": st.column_config.DateColumn("Date"),
        }
    )
    
    # Visualizations
    st.subheader("Visualizations")
    
    tab1, tab2, tab3 = st.tabs(["Daily Performance", "Strategy Performance", "Pair Performance"])
    
    with tab1:
        # Daily performance
        daily_performance = week_trades.groupby(week_trades["date"].dt.date).agg(
            trade_count=("result_percent", "count"),
            total_profit=("result_percent", "sum"),
            win_count=("trade_result", lambda x: (x == "Win").sum()),
            loss_count=("trade_result", lambda x: (x == "Loss").sum())
        ).reset_index()
        
        daily_performance["winrate"] = (daily_performance["win_count"] / daily_performance["trade_count"]) * 100
        
        # Create a bar chart
        fig = px.bar(
            daily_performance,
            x="date",
            y="total_profit",
            title="Daily Performance",
            color="total_profit",
            color_continuous_scale="RdYlGn",
            text=daily_performance["total_profit"].round(2).astype(str) + "%"
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Show daily winrate
        fig = px.line(
            daily_performance,
            x="date",
            y="winrate",
            title="Daily Winrate",
            markers=True
        )
        fig.update_traces(line=dict(color="#1f77b4", width=3), marker=dict(size=10))
        st.plotly_chart(fig, use_container_width=True)
    
    with tab2:
        # Strategy performance
        if "strategy" in week_trades.columns:
            strategy_performance = week_trades.groupby("strategy").agg(
                trade_count=("result_percent", "count"),
                total_profit=("result_percent", "sum"),
                win_count=("trade_result", lambda x: (x == "Win").sum()),
                loss_count=("trade_result", lambda x: (x == "Loss").sum())
            ).reset_index()
            
            strategy_performance["winrate"] = (strategy_performance["win_count"] / strategy_performance["trade_count"]) * 100
            
            # Create a bar chart
            fig = px.bar(
                strategy_performance,
                x="strategy",
                y="total_profit",
                title="Strategy Performance",
                color="total_profit",
                color_continuous_scale="RdYlGn",
                text=strategy_performance["total_profit"].round(2).astype(str) + "%"
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Show strategy winrate
            fig = px.bar(
                strategy_performance,
                x="strategy",
                y="winrate",
                title="Strategy Winrate",
                color="winrate",
                color_continuous_scale="Blues",
                text=strategy_performance["winrate"].round(2).astype(str) + "%"
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No strategy data available.")
    
    with tab3:
        # Pair performance
        if "pair" in week_trades.columns:
            pair_performance = week_trades.groupby("pair").agg(
                trade_count=("result_percent", "count"),
                total_profit=("result_percent", "sum"),
                win_count=("trade_result", lambda x: (x == "Win").sum()),
                loss_count=("trade_result", lambda x: (x == "Loss").sum())
            ).reset_index()
            
            pair_performance["winrate"] = (pair_performance["win_count"] / pair_performance["trade_count"]) * 100
            
            # Create a bar chart
            fig = px.bar(
                pair_performance,
                x="pair",
                y="total_profit",
                title="Pair Performance",
                color="total_profit",
                color_continuous_scale="RdYlGn",
                text=pair_performance["total_profit"].round(2).astype(str) + "%"
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Show pair winrate
            fig = px.bar(
                pair_performance,
                x="pair",
                y="winrate",
                title="Pair Winrate",
                color="winrate",
                color_continuous_scale="Blues",
                text=pair_performance["winrate"].round(2).astype(str) + "%"
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No pair data available.")
    
    # Comparison with previous weeks
    st.subheader("Comparison with Previous Weeks")
    
    # Prepare data for comparison
    weeks_data = weekly_data.sort_values(["year", "week"], ascending=True).tail(num_weeks_to_show)
    
    # Create week labels
    weeks_data["week_label"] = weeks_data.apply(
        lambda x: f"W{x['week']}/{x['year']}", axis=1
    )
    
    # Create line chart for winrate comparison
    fig = px.line(
        weeks_data,
        x="week_label",
        y="winrate",
        title="Weekly Winrate Trend",
        markers=True,
        labels={"winrate": "Winrate (%)", "week_label": "Week"}
    )
    fig.update_traces(line=dict(width=3), marker=dict(size=10))
    st.plotly_chart(fig, use_container_width=True)
    
    # Create bar chart for profit comparison
    fig = px.bar(
        weeks_data,
        x="week_label",
        y="total_profit",
        title="Weekly Profit Comparison",
        color="total_profit",
        color_continuous_scale="RdYlGn",
        labels={"total_profit": "Total Profit (%)", "week_label": "Week"},
        text=weeks_data["total_profit"].round(2).astype(str) + "%"
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Create a table with all weekly data
    st.subheader("Weekly Performance Summary")
    
    # Format the table
    display_cols = [
        "week_label", "trade_count", "win_count", "loss_count", 
        "winrate", "total_profit", "avg_profit"
    ]
    
    st.dataframe(
        weeks_data[display_cols],
        use_container_width=True,
        column_config={
            "week_label": st.column_config.TextColumn("Week"),
            "trade_count": st.column_config.NumberColumn("# Trades"),
            "win_count": st.column_config.NumberColumn("Wins"),
            "loss_count": st.column_config.NumberColumn("Losses"),
            "winrate": st.column_config.NumberColumn("Winrate (%)", format="%.2f%%"),
            "total_profit": st.column_config.NumberColumn("Total P&L (%)", format="%.2f%%"),
            "avg_profit": st.column_config.NumberColumn("Avg Trade (%)", format="%.2f%%"),
        }
    ) 