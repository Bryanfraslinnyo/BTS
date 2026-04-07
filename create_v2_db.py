import pymysql
import os
from dotenv import load_dotenv

# Charger les variables depuis le .env actuel
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

# Parser la DATABASE_URL actuelle pour obtenir les crédentials (host, user, pass)
# URL format: mysql+pymysql://user:pass@host:port/db?charset=utf8mb4
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("DATABASE_URL not found in .env")
    exit(1)

# Extraction simple (on suppose le format standard du projet)
try:
    # On enlève mysql+pymysql://
    conn_str = db_url.split('://')[1].split('?')[0]
    auth, host_db = conn_str.split('@')
    user, password = auth.split(':')
    host, _ = host_db.split(':') if ':' in host_db else (host_db.split('/')[0], None)
    
    # On essaye d'abord avec root pour la création car iug_user peut manquer de droits
    try:
        connection = pymysql.connect(
            host=host,
            user='root',
            password='',
            charset='utf8mb4'
        )
    except:
        # Fallback sur les credentials du .env si root échoue
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            charset='utf8mb4'
        )
    
    new_db_name = "iug_health_v2_db"
    
    with connection.cursor() as cursor:
        # Créer la base de données v2
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {new_db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print(f"Database {new_db_name} created or already exists.")
        
        # Accorder les privilèges à l'utilisateur iug_user (extraits du .env)
        try:
            cursor.execute(f"GRANT ALL PRIVILEGES ON {new_db_name}.* TO '{user}'@'localhost';")
            cursor.execute("FLUSH PRIVILEGES;")
            print(f"Privileges granted to {user} on {new_db_name}")
        except Exception as ge:
            print(f"Warning: Could not grant privileges (maybe not root): {ge}")
        
    connection.close()
    
    # Mettre à jour le .env
    env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    with open(env_path, 'w') as f:
        for line in lines:
            if line.startswith('DATABASE_URL='):
                new_url = db_url.replace('/iug_health_db', f'/{new_db_name}')
                f.write(f"DATABASE_URL={new_url}\n")
            else:
                f.write(line)
    
    print(f".env updated with {new_db_name}")

except Exception as e:
    print(f"Error: {e}")
    exit(1)
