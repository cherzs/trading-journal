import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.trade_analysis import identify_best_strategies, calculate_risk_metrics

st.set_page_config(
    page_title="Strategy Backtester - Trading Journal",
    page_icon="📈",
    layout="wide"
)

# Title
st.title("🧪 Strategy Backtester")

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
    st.info("No trades yet. Add some trades to analyze strategy performance.")
else:
    # Create a copy of the dataframe and ensure date is datetime type
    df = st.session_state.trades.copy()
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
    
    # Sidebar filters
    st.sidebar.header("Filters")
    
    # Date range filter
    min_date = df["date"].min().date()
    max_date = df["date"].max().date()
    
    date_range = st.sidebar.date_input(
        "Date Range",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )
    
    if len(date_range) == 2:
        start_date, end_date = date_range
        df = df[(df["date"].dt.date >= start_date) & (df["date"].dt.date <= end_date)]
    
    # Strategy filter
    if "strategy" in df.columns:
        strategies = df["strategy"].unique().tolist()
        selected_strategies = st.sidebar.multiselect(
            "Filter by Strategy",
            options=strategies,
            default=strategies
        )
        
        if selected_strategies:
            df = df[df["strategy"].isin(selected_strategies)]
    
    # Pair filter
    if "pair" in df.columns:
        pairs = df["pair"].unique().tolist()
        selected_pairs = st.sidebar.multiselect(
            "Filter by Pair",
            options=pairs,
            default=pairs
        )
        
        if selected_pairs:
            df = df[df["pair"].isin(selected_pairs)]
    
    # Timeframe filter
    if "timeframe" in df.columns:
        timeframes = df["timeframe"].unique().tolist()
        selected_timeframes = st.sidebar.multiselect(
            "Filter by Timeframe",
            options=timeframes,
            default=timeframes
        )
        
        if selected_timeframes:
            df = df[df["timeframe"].isin(selected_timeframes)]
    
    # Main content
    # Basic stats in top row
    total_trades = len(df)
    
    if total_trades > 0:
        wins = len(df[df["trade_result"] == "Win"])
        losses = len(df[df["trade_result"] == "Loss"])
        winrate = (wins / total_trades) * 100 if total_trades > 0 else 0
        
        total_profit = df["result_percent"].sum()
        avg_profit = df["result_percent"].mean()
        
        col1, col2, col3, col4 = st.columns(4)
        
        col1.metric("Total Trades", total_trades)
        col2.metric("Winrate", f"{winrate:.2f}%")
        col3.metric("Total P&L", f"{total_profit:.2f}%")
        col4.metric("Avg Trade", f"{avg_profit:.2f}%")
        
        # Strategy Performance Analysis
        if "strategy" in df.columns:
            st.header("Strategy Performance Analysis")
            
            # Get strategy metrics
            strategy_metrics = identify_best_strategies(df, min_trades=1)
            
            if not strategy_metrics.empty:
                # Bar chart showing strategy winrates
                fig = px.bar(
                    strategy_metrics,
                    x="strategy",
                    y="winrate",
                    title="Strategy Winrates",
                    color="winrate",
                    text=strategy_metrics["winrate"].round(1).astype(str) + "%",
                    hover_data=["trade_count", "win_count", "loss_count", "total_profit"]
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Bar chart showing strategy profitability
                fig = px.bar(
                    strategy_metrics,
                    x="strategy",
                    y="total_profit",
                    title="Strategy Total P&L",
                    color="total_profit",
                    color_continuous_scale="RdYlGn",
                    text=strategy_metrics["total_profit"].round(2).astype(str) + "%",
                    hover_data=["trade_count", "win_count", "loss_count", "winrate"]
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Strategy metrics table
                st.subheader("Strategy Metrics")
                
                # Add more metrics
                strategy_metrics["win_loss_ratio"] = strategy_metrics["win_count"] / strategy_metrics["loss_count"].replace(0, 1)
                strategy_metrics["avg_win"] = df[df["trade_result"] == "Win"].groupby("strategy")["result_percent"].mean().reindex(strategy_metrics["strategy"]).values
                strategy_metrics["avg_loss"] = df[df["trade_result"] == "Loss"].groupby("strategy")["result_percent"].mean().reindex(strategy_metrics["strategy"]).values
                
                # Calculate expected value
                strategy_metrics["expected_value"] = (strategy_metrics["winrate"] / 100 * strategy_metrics["avg_win"]) + \
                                                  ((100 - strategy_metrics["winrate"]) / 100 * strategy_metrics["avg_loss"])
                
                # Display table
                st.dataframe(
                    strategy_metrics,
                    use_container_width=True,
                    column_config={
                        "strategy": st.column_config.TextColumn("Strategy"),
                        "trade_count": st.column_config.NumberColumn("# Trades"),
                        "win_count": st.column_config.NumberColumn("Wins"),
                        "loss_count": st.column_config.NumberColumn("Losses"),
                        "total_profit": st.column_config.NumberColumn("Total P&L (%)", format="%.2f%%"),
                        "avg_profit": st.column_config.NumberColumn("Avg P&L (%)", format="%.2f%%"),
                        "winrate": st.column_config.NumberColumn("Winrate", format="%.2f%%"),
                        "win_loss_ratio": st.column_config.NumberColumn("W/L Ratio", format="%.2f"),
                        "avg_win": st.column_config.NumberColumn("Avg Win (%)", format="%.2f%%"),
                        "avg_loss": st.column_config.NumberColumn("Avg Loss (%)", format="%.2f%%"),
                        "expected_value": st.column_config.NumberColumn("Expected Value", format="%.2f%%"),
                    }
                )
            else:
                st.info("No strategy data available for the selected period.")
        
        # Strategy Comparison
        if "strategy" in df.columns and len(df["strategy"].unique()) > 1:
            st.header("Strategy Comparison")
            
            # Select strategies to compare
            strategies_to_compare = st.multiselect(
                "Select strategies to compare",
                options=df["strategy"].unique(),
                default=list(df["strategy"].unique())[:2]  # Default to first two strategies
            )
            
            if len(strategies_to_compare) >= 2:
                # Filter for selected strategies
                comparison_df = df[df["strategy"].isin(strategies_to_compare)]
                
                # Create equity curves for each strategy
                strategy_equity = {}
                
                for strategy in strategies_to_compare:
                    strategy_df = comparison_df[comparison_df["strategy"] == strategy].sort_values("date")
                    strategy_equity[strategy] = strategy_df["result_percent"].cumsum()
                
                # Create a DataFrame for plotting
                equity_df = pd.DataFrame()
                for strategy, equity in strategy_equity.items():
                    equity_df[strategy] = equity.reset_index(drop=True)
                
                # Create line chart
                fig = go.Figure()
                
                for strategy in equity_df.columns:
                    fig.add_trace(go.Scatter(
                        y=equity_df[strategy],
                        mode='lines',
                        name=strategy
                    ))
                
                fig.update_layout(
                    title="Equity Curve Comparison",
                    xaxis_title="Trades",
                    yaxis_title="Cumulative Return (%)",
                    legend_title="Strategy"
                )
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Risk metrics comparison
                risk_metrics = {}
                
                for strategy in strategies_to_compare:
                    strategy_df = comparison_df[comparison_df["strategy"] == strategy]
                    risk_metrics[strategy] = calculate_risk_metrics(strategy_df)
                
                # Create a DataFrame for metrics
                metrics_df = pd.DataFrame.from_dict(risk_metrics, orient='index')
                
                # Display metrics comparison
                st.subheader("Risk Metrics Comparison")
                
                st.dataframe(
                    metrics_df,
                    use_container_width=True,
                    column_config={
                        "sharpe_ratio": st.column_config.NumberColumn("Sharpe Ratio", format="%.2f"),
                        "profit_factor": st.column_config.NumberColumn("Profit Factor", format="%.2f"),
                        "max_drawdown": st.column_config.NumberColumn("Max Drawdown (%)", format="%.2f%%"),
                        "max_drawdown_duration": st.column_config.NumberColumn("Drawdown Duration (days)"),
                        "avg_rr_ratio": st.column_config.NumberColumn("Avg R:R Ratio", format="%.2f"),
                    }
                )
            else:
                st.info("Select at least 2 strategies to compare.")
        
        # Timeframe Analysis
        if "timeframe" in df.columns:
            st.header("Timeframe Analysis")
            
            # Analyze by timeframe
            timeframe_analysis = df.groupby("timeframe").agg(
                trade_count=("result_percent", "count"),
                win_count=("trade_result", lambda x: (x == "Win").sum()),
                loss_count=("trade_result", lambda x: (x == "Loss").sum()),
                total_profit=("result_percent", "sum"),
                avg_profit=("result_percent", "mean")
            ).reset_index()
            
            timeframe_analysis["winrate"] = (timeframe_analysis["win_count"] / timeframe_analysis["trade_count"]) * 100
            
            # Create a bar chart
            fig = px.bar(
                timeframe_analysis,
                x="timeframe",
                y="winrate",
                title="Winrate by Timeframe",
                color="winrate",
                text=timeframe_analysis["winrate"].round(1).astype(str) + "%",
                hover_data=["trade_count", "win_count", "loss_count", "total_profit"]
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Profitability by timeframe
            fig = px.bar(
                timeframe_analysis,
                x="timeframe",
                y="total_profit",
                title="Total P&L by Timeframe",
                color="total_profit",
                color_continuous_scale="RdYlGn",
                text=timeframe_analysis["total_profit"].round(2).astype(str) + "%",
                hover_data=["trade_count", "win_count", "loss_count", "winrate"]
            )
            st.plotly_chart(fig, use_container_width=True)
        
        # Pair Analysis
        if "pair" in df.columns:
            st.header("Pair Analysis")
            
            # Analyze by pair
            pair_analysis = df.groupby("pair").agg(
                trade_count=("result_percent", "count"),
                win_count=("trade_result", lambda x: (x == "Win").sum()),
                loss_count=("trade_result", lambda x: (x == "Loss").sum()),
                total_profit=("result_percent", "sum"),
                avg_profit=("result_percent", "mean")
            ).reset_index()
            
            pair_analysis["winrate"] = (pair_analysis["win_count"] / pair_analysis["trade_count"]) * 100
            
            # Sort by trade count
            pair_analysis = pair_analysis.sort_values("trade_count", ascending=False)
            
            # Top pairs by volume
            top_n = min(10, len(pair_analysis))
            top_pairs = pair_analysis.head(top_n)
            
            # Create a bar chart for winrate
            fig = px.bar(
                top_pairs,
                x="pair",
                y="winrate",
                title=f"Winrate by Pair (Top {top_n} by Volume)",
                color="winrate",
                text=top_pairs["winrate"].round(1).astype(str) + "%",
                hover_data=["trade_count", "win_count", "loss_count", "total_profit"]
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Profitability by pair
            fig = px.bar(
                top_pairs,
                x="pair",
                y="total_profit",
                title=f"Total P&L by Pair (Top {top_n} by Volume)",
                color="total_profit",
                color_continuous_scale="RdYlGn",
                text=top_pairs["total_profit"].round(2).astype(str) + "%",
                hover_data=["trade_count", "win_count", "loss_count", "winrate"]
            )
            st.plotly_chart(fig, use_container_width=True)
        
        # Advanced Strategy Analysis - Correlation Matrix
        if "strategy" in df.columns and len(df["strategy"].unique()) > 1:
            st.header("Advanced Strategy Analysis")
            
            # Create daily returns by strategy
            daily_returns = df.groupby(["date", "strategy"])["result_percent"].sum().reset_index()
            daily_returns_pivot = daily_returns.pivot(index="date", columns="strategy", values="result_percent").fillna(0)
            
            # Create correlation matrix
            correlation = daily_returns_pivot.corr()
            
            # Plot heatmap
            fig = px.imshow(
                correlation,
                text_auto=True,
                color_continuous_scale="RdBu_r",
                title="Strategy Correlation Matrix",
                labels=dict(color="Correlation")
            )
            st.plotly_chart(fig, use_container_width=True)
            
            st.info("Strategies with low or negative correlation can potentially be combined for a more robust trading approach.")
            
            # Strategy combinations
            st.subheader("Strategy Combinations")
            st.write("The following analysis shows how combining different strategies could affect your overall performance.")
            
            # Allow user to select strategies to combine
            combination_strategies = st.multiselect(
                "Select strategies to combine",
                options=df["strategy"].unique(),
                default=list(df["strategy"].unique())[:2]  # Default to first two strategies
            )
            
            if len(combination_strategies) >= 2:
                # Create combined equity curve
                combined_df = df[df["strategy"].isin(combination_strategies)]
                combined_daily = combined_df.groupby("date")["result_percent"].sum().reset_index()
                combined_daily["cumulative"] = combined_daily["result_percent"].cumsum()
                
                # Create a combined equity curve for the selected strategies
                fig = px.line(
                    combined_daily,
                    x="date",
                    y="cumulative",
                    title="Combined Strategy Equity Curve",
                    labels={"cumulative": "Cumulative Return (%)", "date": "Date"}
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Calculate metrics for the combined strategy
                combined_metrics = {
                    "Trade Count": len(combined_df),
                    "Win Count": len(combined_df[combined_df["trade_result"] == "Win"]),
                    "Loss Count": len(combined_df[combined_df["trade_result"] == "Loss"]),
                    "Winrate": (len(combined_df[combined_df["trade_result"] == "Win"]) / len(combined_df)) * 100 if len(combined_df) > 0 else 0,
                    "Total P&L": combined_df["result_percent"].sum(),
                    "Average P&L": combined_df["result_percent"].mean(),
                    "Max Drawdown": calculate_risk_metrics(combined_df)["max_drawdown"]
                }
                
                # Display metrics
                st.subheader("Combined Strategy Metrics")
                
                # Convert to DataFrame for better display
                metrics_df = pd.DataFrame([combined_metrics])
                
                st.dataframe(
                    metrics_df,
                    use_container_width=True,
                    column_config={
                        "Trade Count": st.column_config.NumberColumn("# Trades"),
                        "Win Count": st.column_config.NumberColumn("Wins"),
                        "Loss Count": st.column_config.NumberColumn("Losses"),
                        "Winrate": st.column_config.NumberColumn("Winrate", format="%.2f%%"),
                        "Total P&L": st.column_config.NumberColumn("Total P&L (%)", format="%.2f%%"),
                        "Average P&L": st.column_config.NumberColumn("Avg P&L (%)", format="%.2f%%"),
                        "Max Drawdown": st.column_config.NumberColumn("Max Drawdown (%)", format="%.2f%%")
                    }
                )
            else:
                st.info("Select at least 2 strategies to analyze combinations.") 