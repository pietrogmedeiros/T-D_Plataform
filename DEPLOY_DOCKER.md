# Script de Deploy Local/VPS com Docker

Este documento descreve como fazer o deploy da aplicação T&D Platform usando Docker, seja localmente ou em um VPS.

## 🚀 Deploy com Docker Compose

### Pré-requisitos

- Docker e Docker Compose instalados
- Pelo menos 2GB de RAM disponível
- 10GB de espaço em disco

### 1. Preparar ambiente

```bash
# Clonar/copiar projeto para o servidor
cd t-d-platform

# Criar arquivo de ambiente
cp .env.example .env.production
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env.production`:

```env
# Banco de dados
DATABASE_URL=postgresql://postgres:TdPlatform2025!@postgres:5432/td_platform

# NextAuth
NEXTAUTH_URL=http://seu-dominio.com  # ou http://localhost:3000 para local
NEXTAUTH_SECRET=td-platform-secret-2025-production

# Ambiente
NODE_ENV=production
```

### 3. Executar deploy

```bash
# Build e start dos containers
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

### 4. Acesso à aplicação

- **URL**: http://localhost:3000 (ou seu domínio)
- **Admin**: pietro.medeiros@webcontinental.com.br
- **Senha**: P@ula07021995

## 🔧 Comandos úteis

```bash
# Parar aplicação
docker-compose -f docker-compose.prod.yml down

# Reiniciar apenas a aplicação
docker-compose -f docker-compose.prod.yml restart app

# Ver logs do banco
docker-compose -f docker-compose.prod.yml logs postgres

# Backup do banco
docker exec td_platform_db pg_dump -U postgres td_platform > backup.sql

# Restaurar backup
docker exec -i td_platform_db psql -U postgres td_platform < backup.sql

# Acesso ao banco
docker exec -it td_platform_db psql -U postgres -d td_platform
```

## 🌐 Deploy em VPS/Servidor

### 1. Configurar domínio (opcional)

```bash
# Instalar nginx
sudo apt update && sudo apt install nginx

# Configurar proxy reverso
sudo nano /etc/nginx/sites-available/td-platform
```

Configuração nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/td-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. SSL com Certbot (recomendado)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo systemctl enable certbot.timer
```

## 📊 Monitoramento

### Verificar saúde da aplicação

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f app
```

### Métricas importantes

- **CPU**: < 50% em uso normal
- **Memória**: < 1GB por container
- **Disco**: Monitorar uploads de vídeo
- **Rede**: Latência < 100ms

## 🔒 Segurança

### Firewall

```bash
# Configurar UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Backup automático

```bash
# Criar script de backup
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec td_platform_db pg_dump -U postgres td_platform > "backup_${DATE}.sql"
# Upload para cloud storage (opcional)
```

## 🚨 Troubleshooting

### Problemas comuns

1. **Container não inicia**
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Banco não conecta**
   ```bash
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. **Falta de espaço**
   ```bash
   docker system prune -a
   ```

4. **Performance lenta**
   ```bash
   docker stats
   htop
   ```

### Logs importantes

- `/var/log/nginx/` - Logs do nginx
- `docker logs td_platform_app` - Logs da aplicação
- `docker logs td_platform_db` - Logs do banco

## 💰 Custos estimados

### VPS recomendado

- **Digital Ocean**: $12-24/mês (2-4GB RAM)
- **Linode**: $10-20/mês (2-4GB RAM)  
- **AWS Lightsail**: $10-20/mês (2-4GB RAM)
- **Vultr**: $10-20/mês (2-4GB RAM)

### Recursos mínimos

- **CPU**: 1 vCPU
- **RAM**: 2GB
- **Disco**: 25GB SSD
- **Banda**: 1TB/mês

## 📞 Suporte

Para problemas com o deploy:

1. Verificar logs: `docker-compose logs`
2. Testar conectividade: `curl http://localhost:3000`
3. Verificar portas: `netstat -tlnp`
4. Reiniciar serviços: `docker-compose restart`
