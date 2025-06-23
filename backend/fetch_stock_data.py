import yfinance as yf

def get_stock_data(ticker: str, period: str = "1mo"):
    data = yf.Ticker(ticker)
    hist = data.history(period=period)
    
    history_with_dates = []
    for date, row in hist.iterrows():
        history_with_dates.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Open": row["Open"],
            "High": row["High"], 
            "Low": row["Low"],
            "Close": row["Close"],
            "Volume": int(row["Volume"]),
            "Dividends": row["Dividends"],
            "Stock Splits": row["Stock Splits"]
        })
    
    return {"info": data.info, "history": history_with_dates}

if __name__ == "__main__":
    print(get_stock_data("AAPL"))
