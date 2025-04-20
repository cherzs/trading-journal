import os
import shutil
import pandas as pd

def load_sample_data():
    """
    Load sample trade data into the application's data file.
    This will overwrite any existing data in trades.csv.
    """
    
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    sample_file = "data/sample_trades.csv"
    target_file = "data/trades.csv"
    
    if os.path.exists(sample_file):
        # Copy the sample data to the actual data file
        shutil.copy(sample_file, target_file)
        print(f"✅ Sample data loaded successfully into {target_file}")
        
        # Display summary of loaded data
        df = pd.read_csv(target_file)
        total_trades = len(df)
        wins = len(df[df["trade_result"] == "Win"])
        losses = len(df[df["trade_result"] == "Loss"])
        winrate = (wins / total_trades) * 100 if total_trades > 0 else 0
        
        print(f"\nLoaded {total_trades} trades:")
        print(f"  - {wins} winning trades")
        print(f"  - {losses} losing trades")
        print(f"  - {winrate:.2f}% winrate")
        
        # List unique strategies
        strategies = df["strategy"].unique()
        print(f"\nStrategies included: {', '.join(strategies)}")
        
        # List unique pairs
        pairs = df["pair"].unique()
        print(f"\nPairs included: {', '.join(pairs)}")
        
        print("\nYou can now run the application with:")
        print("  streamlit run app.py")
    else:
        print(f"❌ Error: Sample data file {sample_file} not found!")

if __name__ == "__main__":
    load_sample_data() 