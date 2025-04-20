import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_weekly_performance(trades_df):
    """
    Calculate weekly performance metrics from trade data
    
    Args:
        trades_df: Pandas DataFrame containing trade data
        
    Returns:
        DataFrame with weekly performance metrics
    """
    if len(trades_df) == 0:
        return pd.DataFrame()
    
    # Convert date to datetime if not already
    df = trades_df.copy()
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
    
    # Create week column
    df["week"] = df["date"].dt.isocalendar().week
    df["year"] = df["date"].dt.isocalendar().year
    
    # Group by week and calculate metrics
    weekly_stats = df.groupby(["year", "week"]).agg(
        start_date=("date", "min"),
        end_date=("date", "max"),
        trade_count=("result_percent", "count"),
        win_count=("trade_result", lambda x: (x == "Win").sum()),
        loss_count=("trade_result", lambda x: (x == "Loss").sum()),
        total_profit=("result_percent", "sum"),
        avg_profit=("result_percent", "mean"),
    ).reset_index()
    
    # Calculate additional metrics
    weekly_stats["winrate"] = (weekly_stats["win_count"] / weekly_stats["trade_count"]) * 100
    
    return weekly_stats

def identify_best_strategies(trades_df, min_trades=5):
    """
    Identify the best-performing strategies
    
    Args:
        trades_df: Pandas DataFrame containing trade data
        min_trades: Minimum number of trades for a strategy to be considered
        
    Returns:
        DataFrame with strategy performance metrics, sorted by profitability
    """
    if len(trades_df) == 0:
        return pd.DataFrame()
    
    # Group by strategy
    strategy_stats = trades_df.groupby("strategy").agg(
        trade_count=("result_percent", "count"),
        win_count=("trade_result", lambda x: (x == "Win").sum()),
        loss_count=("trade_result", lambda x: (x == "Loss").sum()),
        total_profit=("result_percent", "sum"),
        avg_profit=("result_percent", "mean"),
    ).reset_index()
    
    # Calculate additional metrics
    strategy_stats["winrate"] = (strategy_stats["win_count"] / strategy_stats["trade_count"]) * 100
    
    # Filter by minimum trades
    strategy_stats = strategy_stats[strategy_stats["trade_count"] >= min_trades]
    
    # Sort by profitability
    return strategy_stats.sort_values("total_profit", ascending=False)

def calculate_drawdown(trades_df):
    """
    Calculate maximum drawdown from equity curve
    
    Args:
        trades_df: Pandas DataFrame containing trade data
        
    Returns:
        max_drawdown: Maximum drawdown value
        max_drawdown_duration: Duration of maximum drawdown in days
    """
    if len(trades_df) == 0:
        return 0, 0
    
    # Convert date to datetime if not already
    df = trades_df.copy()
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
    
    # Calculate cumulative equity
    df["cumulative_result"] = df["result_percent"].cumsum()
    
    # Calculate drawdown
    df["peak"] = df["cumulative_result"].cummax()
    df["drawdown"] = df["peak"] - df["cumulative_result"]
    
    # Find maximum drawdown
    max_drawdown = df["drawdown"].max()
    
    # Calculate drawdown duration
    if max_drawdown > 0:
        # Find where the maximum drawdown begins
        drawdown_begin = df[df["peak"] > df["cumulative_result"]].iloc[0]["date"]
        
        # Find where the drawdown ends (when we reach a new peak)
        drawdown_end_idx = df[df["date"] >= drawdown_begin]["cumulative_result"].idxmax()
        drawdown_end = df.loc[drawdown_end_idx, "date"]
        
        max_drawdown_duration = (drawdown_end - drawdown_begin).days
    else:
        max_drawdown_duration = 0
    
    return max_drawdown, max_drawdown_duration

def calculate_risk_metrics(trades_df):
    """
    Calculate various risk metrics
    
    Args:
        trades_df: Pandas DataFrame containing trade data
        
    Returns:
        Dictionary with risk metrics
    """
    if len(trades_df) == 0:
        return {
            "sharpe_ratio": 0,
            "profit_factor": 0,
            "max_drawdown": 0,
            "max_drawdown_duration": 0,
            "avg_rr_ratio": 0
        }
    
    # Calculate profit and loss stats
    win_trades = trades_df[trades_df["trade_result"] == "Win"]
    loss_trades = trades_df[trades_df["trade_result"] == "Loss"]
    
    # Sharpe ratio calculation (simplified)
    daily_returns = trades_df.groupby(pd.to_datetime(trades_df["date"]).dt.date)["result_percent"].sum()
    sharpe_ratio = 0
    if len(daily_returns) > 0 and daily_returns.std() > 0:
        sharpe_ratio = (daily_returns.mean() / daily_returns.std()) * np.sqrt(252)  # Annualized
    
    # Profit factor
    total_win = win_trades["result_percent"].sum() if len(win_trades) > 0 else 0
    total_loss = abs(loss_trades["result_percent"].sum()) if len(loss_trades) > 0 else 0
    profit_factor = 0
    if total_loss > 0:
        profit_factor = total_win / total_loss
    
    # Drawdown
    max_drawdown, max_drawdown_duration = calculate_drawdown(trades_df)
    
    # Average risk-reward ratio
    avg_rr_ratio = 0
    if "stop_loss" in trades_df.columns and "take_profit" in trades_df.columns and "entry_price" in trades_df.columns:
        # Filter valid entries only
        valid_trades = trades_df[(trades_df["entry_price"] > 0) & 
                               (trades_df["stop_loss"] > 0) & 
                               (trades_df["take_profit"] > 0)]
        
        if len(valid_trades) > 0:
            # Calculate individual RR ratios
            long_trades = valid_trades[valid_trades["take_profit"] > valid_trades["entry_price"]]
            short_trades = valid_trades[valid_trades["take_profit"] < valid_trades["entry_price"]]
            
            rr_ratios = []
            
            if len(long_trades) > 0:
                long_rr = (long_trades["take_profit"] - long_trades["entry_price"]) / (long_trades["entry_price"] - long_trades["stop_loss"])
                rr_ratios.extend(long_rr.tolist())
                
            if len(short_trades) > 0:
                short_rr = (short_trades["entry_price"] - short_trades["take_profit"]) / (short_trades["stop_loss"] - short_trades["entry_price"])
                rr_ratios.extend(short_rr.tolist())
                
            if rr_ratios:
                avg_rr_ratio = np.mean(rr_ratios)
    
    return {
        "sharpe_ratio": sharpe_ratio,
        "profit_factor": profit_factor,
        "max_drawdown": max_drawdown,
        "max_drawdown_duration": max_drawdown_duration,
        "avg_rr_ratio": avg_rr_ratio
    }

def get_trade_streaks(trades_df):
    """
    Analyze win and loss streaks
    
    Args:
        trades_df: Pandas DataFrame containing trade data
        
    Returns:
        Dictionary with streak metrics
    """
    if len(trades_df) == 0 or "trade_result" not in trades_df.columns:
        return {
            "max_win_streak": 0,
            "max_loss_streak": 0,
            "current_streak": 0,
            "current_streak_type": "None"
        }
    
    # Sort by date
    df = trades_df.copy()
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")
    
    # Convert to 1 for win, -1 for loss
    df["result_numeric"] = df["trade_result"].map({"Win": 1, "Loss": -1})
    
    # Calculate streaks
    streaks = []
    current_streak = 0
    current_streak_type = None
    
    for result in df["result_numeric"]:
        if result == 1:  # Win
            if current_streak_type == "Win" or current_streak_type is None:
                current_streak += 1
                current_streak_type = "Win"
            else:
                streaks.append((current_streak_type, current_streak))
                current_streak = 1
                current_streak_type = "Win"
        else:  # Loss
            if current_streak_type == "Loss" or current_streak_type is None:
                current_streak += 1
                current_streak_type = "Loss"
            else:
                streaks.append((current_streak_type, current_streak))
                current_streak = 1
                current_streak_type = "Loss"
    
    # Add the last streak
    if current_streak > 0:
        streaks.append((current_streak_type, current_streak))
    
    # Calculate max streaks
    win_streaks = [s[1] for s in streaks if s[0] == "Win"]
    loss_streaks = [s[1] for s in streaks if s[0] == "Loss"]
    
    max_win_streak = max(win_streaks) if win_streaks else 0
    max_loss_streak = max(loss_streaks) if loss_streaks else 0
    
    return {
        "max_win_streak": max_win_streak,
        "max_loss_streak": max_loss_streak,
        "current_streak": current_streak,
        "current_streak_type": current_streak_type or "None"
    } 