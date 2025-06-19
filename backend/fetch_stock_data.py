import yfinance as yf

def get_stock_data(ticker: str, period: str = "1mo"):
    data = yf.Ticker(ticker)
    return {"info": data.info, "history": data.history(period=period).to_dict(orient="records")}

if __name__ == "__main__":
    print(get_stock_data("AAPL"))
