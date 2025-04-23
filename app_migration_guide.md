# Panduan Migrasi ke PostgreSQL

Berikut adalah langkah-langkah untuk memigrasi aplikasi dari penyimpanan in-memory dan CSV ke PostgreSQL:

## 1. Persiapan PostgreSQL

1. Install PostgreSQL di server Anda
2. Buat database baru:
   ```
   createdb trading_journal
   ```
3. Konfigurasikan kredensial di file `.env`

## 2. Konfigurasi Aplikasi

1. Pastikan Anda telah menginstall semua paket di `requirements.txt`:
   ```
   pip install -r requirements.txt
   ```

2. Perbaiki impor pada `App.py`, tambahkan di bagian atas:
   ```python
   from models import db, User, Trade
   from config import get_config
   from flask_migrate import Migrate
   ```

3. Hapus kelas User lama dan database in-memory:
   ```python
   # Hapus definisi class User
   # Hapus variabel users dan trades_db
   ```

4. Inisialisasi aplikasi dan database:
   ```python
   # Setelah membuat app
   app.config.from_object(get_config())
   db.init_app(app)
   migrate = Migrate(app, db)
   ```

## 3. Update Fungsi-fungsi

Berikut ini fungsi-fungsi yang perlu diupdate:

### Fungsi Login
```python
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@app.route('/login', methods=['GET', 'POST'])
def login():
    # ...
    user = User.query.filter_by(email=form.email.data).first()
    # ...
```

### Fungsi Register
```python
@app.route('/register', methods=['GET', 'POST'])
def register():
    # ...
    # Cek apakah email sudah ada
    existing_user = User.query.filter_by(email=form.email.data).first()
    if existing_user:
        flash('Email sudah terdaftar', 'danger')
        return redirect(url_for('login'))
    
    # Cek apakah username sudah ada
    existing_username = User.query.filter_by(username=form.username.data).first()
    if existing_username:
        flash('Username sudah digunakan', 'danger')
        return redirect(url_for('register'))
    
    # Buat user baru
    hashed_password = generate_password_hash(form.password.data)
    new_user = User(
        id=str(uuid.uuid4()),
        username=form.username.data,
        email=form.email.data,
        password_hash=hashed_password,
        is_verified=False
    )
    
    # Simpan ke database
    db.session.add(new_user)
    db.session.commit()
```

### Fungsi Trades
```python
@app.route('/trades')
@login_required
def trades():
    # Filter dan pagination
    page = request.args.get('page', 1, type=int)
    per_page = 10  # Jumlah trades per halaman
    
    # Filter berdasarkan symbol dan strategy
    symbol_filter = request.args.get('symbol', '')
    strategy_filter = request.args.get('strategy', '')
    
    # Query dasar
    query = Trade.query.filter_by(user_id=current_user.id)
    
    # Terapkan filter jika ada
    if symbol_filter:
        query = query.filter_by(symbol=symbol_filter)
    if strategy_filter:
        query = query.filter_by(strategy=strategy_filter)
    
    # Sorting berdasarkan tanggal (terbaru dulu)
    query = query.order_by(Trade.date.desc())
    
    # Pagination
    pagination = query.paginate(page=page, per_page=per_page)
    trades = pagination.items
    
    # Dapatkan daftar unik simbol dan strategi untuk filter
    symbols = db.session.query(Trade.symbol).filter_by(user_id=current_user.id).distinct().all()
    symbols = [symbol[0] for symbol in symbols]
    
    strategies = db.session.query(Trade.strategy).filter_by(user_id=current_user.id).distinct().all()
    strategies = [strategy[0] for strategy in strategies]
    
    return render_template(
        'trades.html', 
        trades=trades, 
        symbols=symbols,
        strategies=strategies,
        page=page,
        per_page=per_page,
        total_trades=pagination.total,
        total_pages=pagination.pages
    )
```

### Fungsi Add Trade
```python
@app.route('/add_trade', methods=['GET', 'POST'])
@login_required
def add_trade():
    form = TradeForm()
    if form.validate_on_submit():
        # Handle file upload
        screenshot_path = None
        if form.screenshot.data:
            filename = secure_filename(f"{uuid.uuid4()}_{form.screenshot.data.filename}")
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            form.screenshot.data.save(save_path)
            screenshot_path = f"uploads/{filename}"
        

        new_trade = Trade(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            date=form.date.data,
            symbol=form.symbol.data.upper(),
            trade_type=form.trade_type.data,
            broker=form.broker.data,
            entry_price=form.entry_price.data,
            exit_price=form.exit_price.data,
            size=form.size.data,
            stop_loss=form.stop_loss.data,
            take_profit=form.take_profit.data,
            strategy=form.strategy.data,
            notes=form.notes.data,
            screenshot_path=screenshot_path
        )
        
        # Simpan ke database
        db.session.add(new_trade)
        db.session.commit()
        
        flash('Trade berhasil ditambahkan!', 'success')
        return redirect(url_for('trades'))
    
    return render_template('add_trade.html', form=form, google_client_id=app.config['GOOGLE_CLIENT_ID'])
```

## 4. Inisialisasi Database

Untuk inisialisasi database, jalankan perintah berikut:

```
# Terminal pertama
export FLASK_APP=migrations.py
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Setelah itu, jalankan aplikasi
python App.py
```

## 5. Migrasi Data Lama ke PostgreSQL

Jika Anda memiliki data lama di CSV, tambahkan skrip migrasi berikut:

```python
def migrate_csv_to_db():
    """Migrate users and trades from CSV to PostgreSQL"""
    # Migration users
    if os.path.exists('users.csv'):
        users_df = pd.read_csv('users.csv')
        for _, row in users_df.iterrows():
            # Check if user exists
            existing_user = User.query.filter_by(id=row['id']).first()
            if not existing_user:
                new_user = User(
                    id=row['id'],
                    username=row['username'],
                    email=row['email'],
                    password_hash=row['password_hash'],
                    is_verified=row['is_verified'],
                    google_id=row['google_id'] if 'google_id' in row else None
                )
                db.session.add(new_user)
    
    # Migration trades
    if os.path.exists('data/trades.csv'):
        trades_df = pd.read_csv('data/trades.csv')
        for _, row in trades_df.iterrows():
            # Check if trade exists
            existing_trade = Trade.query.filter_by(id=row['id']).first()
            if not existing_trade:
                new_trade = Trade(
                    id=row['id'],
                    user_id=row['user_id'],
                    date=datetime.strptime(row['date'], '%Y-%m-%d').date(),
                    symbol=row['symbol'],
                    trade_type=row['trade_type'],
                    broker=row['broker'],
                    entry_price=row['entry_price'],
                    exit_price=row['exit_price'],
                    size=row['size'],
                    stop_loss=row['stop_loss'] if pd.notna(row['stop_loss']) else None,
                    take_profit=row['take_profit'] if pd.notna(row['take_profit']) else None,
                    strategy=row['strategy'],
                    notes=row['notes'] if pd.notna(row['notes']) else None,
                    screenshot_path=row['screenshot_path'] if pd.notna(row['screenshot_path']) else None
                )
                db.session.add(new_trade)
    
    # Commit changes
    db.session.commit()
```

Panggil fungsi ini saat aplikasi pertama kali dijalankan untuk migrasi data. 